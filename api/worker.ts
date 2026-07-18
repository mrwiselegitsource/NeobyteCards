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
      app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
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

  const rawDbId = process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '';
  const databaseId = rawDbId === '(default)' ? '' : rawDbId;
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

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
    // Card credential delivery is now handled manually by the admin dashboard.
    // The worker no longer sends activation emails automatically.
    const dispatchQuery = await db.collection('purchasedCards')
      .where('status', 'in', ['awaiting_dispatch', 'processing'])
      .get();

    for (const doc of dispatchQuery.docs) {
      const card = doc.data();
      if (card.status === 'processing' && autoDispatchEnabled) {
        await doc.ref.update({ status: 'awaiting_dispatch' });
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
