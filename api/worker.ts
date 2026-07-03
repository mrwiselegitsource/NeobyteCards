import admin from 'firebase-admin';

import { getFirestore } from 'firebase-admin/firestore';
import { sendEmailInternal } from './send-email';

let initError: any = null;

function resolveRecipientEmail(card: any): string | null {
  const candidates = [
    card?.ownerEmail,
    card?.email,
    card?.billingEmail,
    card?.customerEmail,
    process.env.DEFAULT_NOTIFICATION_EMAIL,
    process.env.GMAIL_USER,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed) continue;
      if (trimmed === 'guest' || trimmed === 'guest@neobyte.bank') continue;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return trimmed;
      }
    }
  }

  return process.env.DEFAULT_NOTIFICATION_EMAIL || process.env.GMAIL_USER || null;
}

// Initialize Firebase Admin safely
let app: any;
try {
  if (!admin.apps.length) {
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
  } else {
    app = admin.apps[0]!;
  }
} catch (error) {
  console.error("[Worker] Firebase admin init error:", error);
  initError = error;
}

export default async function handler(req: any, res: any) {
  if (initError) {
    return res.status(500).json({ error: 'Failed to parse Service Account JSON. Please check your Vercel Environment Variable for extra spaces or missing quotes.', details: initError.message });
  }

  const db = getFirestore(app, 'remixed-firestore-database-id');

  // 1. Authorization Check
  // Allow UptimeRobot to ping this using ?key=YOUR_CRON_SECRET
  const { key, trigger } = req.query;
  const cronSecret = process.env.CRON_SECRET || 'neobyte_default_secret_2026';
  
  if (key !== cronSecret && trigger !== 'frontend') {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing key parameter.' });
  }

  // We use localhost or VERCEL_URL depending on environment.
  // Note: App URLs in Vercel usually start with NEXT_PUBLIC_ or VERCEL_URL.
  const appUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001';

  try {
    let processedCount = 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Give Firestore writes a short moment to settle before scanning for new purchases.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Fetch global auto-dispatch setting
    const configSnap = await db.collection('settings').doc('general').get();
    const autoDispatchEnabled = configSnap.exists ? configSnap.data()?.autoDispatchEnabled : false;

    // ============================================================================
    // TASK 1: CARD DISPATCH
    // ============================================================================
    const dispatchQuery = await db.collection('purchasedCards')
      .where('status', 'in', ['awaiting_dispatch', 'processing'])
      .get();

    for (const doc of dispatchQuery.docs) {
      const card = doc.data();
      const timestamp = card.purchaseTimestamp || 0;
      const elapsed = now - timestamp;

      let shouldDispatch = false;
      if (autoDispatchEnabled) {
         shouldDispatch = true; // Auto-dispatch everything instantly
      } else if (card.status === 'awaiting_dispatch' && timestamp > 0 && elapsed >= fiveMinutes) {
         shouldDispatch = true; // Normal flow: awaiting_dispatch waits 5 minutes
      }

      if (shouldDispatch) {
        // Dispatch the card
        const newCvv = card.cvv === '***' ? Math.floor(100 + Math.random() * 900).toString() : card.cvv;
        
        // Send Card Activation Email via the existing send-email endpoint
        let emailSent = false;
        const recipientEmail = resolveRecipientEmail(card);
        if (recipientEmail) {
           try {
             // Add a short delay to avoid racing the purchase confirmation email.
             await new Promise(resolve => setTimeout(resolve, 1500));
             
             await sendEmailInternal({
                type: 'card_activation',
                to: recipientEmail,
                data: {
                   cardHolder: card.accountHolder,
                   cardBrand: card.brand,
                   cardNumber: card.cardNumber,
                   expiry: card.expiry,
                   cvv: newCvv,
                   limit: card.limit,
                   purchaseDate: card.purchaseDate,
                   imageURL: card.imageURL,
                }
             });
             console.log(`[Worker] Dispatched card activation email to ${recipientEmail}`);
             emailSent = true;
           } catch(e) {
             console.error(`[Worker] Failed to send dispatch email to ${recipientEmail}`, e);
           }
        } else {
          console.warn(`[Worker] No valid recipient email found for card ${doc.id}; skipping activation email.`);
        }

        if (emailSent) {
          await doc.ref.update({
            status: 'active',
            cvv: newCvv
          });
          processedCount++;
        }
      }
    }

    // ============================================================================
    // TASK 2: BTC AUTO-VERIFICATION
    // ============================================================================
    if (trigger !== 'frontend') {
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
    }

    res.status(200).json({ success: true, processedCount, message: `Worker executed successfully. Processed ${processedCount} items.` });
  } catch (error: any) {
    console.error('[Worker] Fatal error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
