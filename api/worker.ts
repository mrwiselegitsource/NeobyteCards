import admin from 'firebase-admin';

import firebaseConfig from '../firebase-applet-config.json';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
let app;
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("[Worker] Firebase Admin initialized using Service Account JSON.");
    } else {
      console.warn("[Worker] FIREBASE_SERVICE_ACCOUNT_KEY is missing. Background updates may fail due to Firestore rules.");
      app = admin.initializeApp();
    }
  } catch (error) {
    console.error("[Worker] Firebase admin init error:", error);
  }
} else {
  app = admin.apps[0]!;
}

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default async function handler(req: any, res: any) {
  // 1. Authorization Check
  // Allow UptimeRobot to ping this using ?key=YOUR_CRON_SECRET
  const { key } = req.query;
  const cronSecret = process.env.CRON_SECRET || 'neobyte_default_secret_2026';
  
  if (key !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing key parameter.' });
  }

  // We use localhost or VERCEL_URL depending on environment.
  // Note: App URLs in Vercel usually start with NEXT_PUBLIC_ or VERCEL_URL.
  const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001';

  try {
    let processedCount = 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    // ============================================================================
    // TASK 1: 5-MINUTE CARD DISPATCH
    // ============================================================================
    const dispatchQuery = await db.collection('purchasedCards')
      .where('status', '==', 'awaiting_dispatch')
      .get();

    for (const doc of dispatchQuery.docs) {
      const card = doc.data();
      const timestamp = card.purchaseTimestamp || 0;
      const elapsed = now - timestamp;

      if (timestamp > 0 && elapsed >= fiveMinutes) {
        // Dispatch the card
        const newCvv = card.cvv === '***' ? Math.floor(100 + Math.random() * 900).toString() : card.cvv;
        
        await doc.ref.update({
          status: 'active',
          cvv: newCvv
        });

        // Send Card Activation Email via the existing send-email endpoint
        if (card.ownerEmail && card.ownerEmail !== 'guest') {
           try {
             // Import nodemailer instead of fetching to avoid network loops
             const fetchUrl = `${appUrl}/api/send-email`;
             await fetch(fetchUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                   type: 'card_activation',
                   to: card.ownerEmail,
                   data: {
                      cardHolder: card.accountHolder,
                      cardBrand: card.brand,
                      cardNumber: card.cardNumber,
                      expiry: card.expiry,
                      cvv: newCvv,
                      limit: card.limit,
                      purchaseDate: card.purchaseDate,
                   }
                })
             });
             console.log(`[Worker] Dispatched card activation email to ${card.ownerEmail}`);
           } catch(e) {
             console.error(`[Worker] Failed to send dispatch email to ${card.ownerEmail}`, e);
           }
        }
        processedCount++;
      }
    }

    // ============================================================================
    // TASK 2: BTC AUTO-VERIFICATION
    // ============================================================================
    const processingQuery = await db.collection('purchasedCards')
      .where('status', '==', 'processing')
      .get();

    for (const doc of processingQuery.docs) {
      const card = doc.data();
      const notes = card.notes || '';
      
      if (notes.includes('BTC') && notes.includes('Hash:')) {
         const hashMatch = notes.match(/Hash:\s*([a-fA-F0-9]+)/);
         if (hashMatch && hashMatch[1]) {
            const txHash = hashMatch[1];
            try {
              const btcRes = await fetch(`https://blockchain.info/rawtx/${txHash}`);
              if (btcRes.ok) {
                 const txData = await btcRes.json();
                 const confirmations = txData.block_height ? 1 : 0;
                 if (confirmations >= 1) {
                    await doc.ref.update({
                       status: 'awaiting_dispatch',
                       purchaseTimestamp: Date.now(),
                       notes: card.notes + ' [Auto-Verified by Network]'
                    });
                    console.log(`[Worker] Auto-verified BTC Hash: ${txHash} for card ${doc.id}`);
                    processedCount++;
                 }
              }
            } catch(e) {
               console.warn(`[Worker] BTC check failed for ${txHash}`, e);
            }
         }
      }
    }

    res.status(200).json({ success: true, processedCount, message: `Worker executed successfully. Processed ${processedCount} items.` });
  } catch (error: any) {
    console.error('[Worker] Fatal error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
