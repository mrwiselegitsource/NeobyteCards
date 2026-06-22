import nodemailer from 'nodemailer';

export type EmailType = 'welcome' | 'purchase_confirmation' | 'card_activation' | 'abandoned_cart';

export interface EmailPayload {
  type: EmailType;
  to: string;
  data: {
    name?: string;
    username?: string;
    cardName?: string;
    cardNumber?: string;
    cardBrand?: string;
    cardHolder?: string;
    expiry?: string;
    cvv?: string;
    limit?: number;
    price?: number;
    purchaseDate?: string;
    siteUrl?: string;
    paymentMethod?: string;
    orderId?: string;
  };
}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const G = '#adff2f';
const DARK = '#0a0a0a';
const CARD_BG = '#111111';
const TEXT = '#e4e4e7';
const MUTED = '#71717a';

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:${DARK};font-family:'Segoe UI',Arial,sans-serif;color:${TEXT}}
    .w{max-width:600px;margin:0 auto;padding:32px 16px}
    .hdr{text-align:center;padding:20px 0 8px}
    .logo{font-size:11px;font-weight:800;letter-spacing:4px;color:${G};text-transform:uppercase}
    .card{background:${CARD_BG};border:1px solid #222;border-radius:16px;padding:32px;margin:12px 0}
    .badge{display:inline-block;background:rgba(173,255,47,.1);border:1px solid rgba(173,255,47,.2);color:${G};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border-radius:6px}
    .badge-green{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.2);color:#34d399}
    h1{font-size:20px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px}
    .sub{font-size:12px;color:${MUTED};margin-bottom:20px}
    p{font-size:14px;color:${TEXT};line-height:1.65;margin:10px 0}
    .hl{color:${G};font-weight:700;font-family:monospace}
    hr{border:none;border-top:1px solid #222;margin:20px 0}
    .section-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${MUTED};font-weight:700;margin-bottom:8px}
    table{width:100%;border-collapse:collapse}
    td{padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:12px}
    td.lbl{color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:1px;width:50%}
    td.val{text-align:right;color:${TEXT};font-family:monospace;font-weight:600}
    td.val-accent{text-align:right;color:${G};font-family:monospace;font-weight:700}
    .btn{display:inline-block;background:${G};color:#000;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:2px;text-decoration:none;padding:14px 32px;border-radius:10px;margin:20px 0}
    .warn{background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:14px;margin-top:12px}
    .warn p{font-size:12px;color:#f87171;margin:0}
    .ftr{text-align:center;padding:24px 0;font-size:11px;color:#444;line-height:1.7}
  </style>
</head>
<body>
  <div class="w">
    <div class="hdr"><div class="logo">⬡ NeoByte Bank</div></div>
    ${body}
    <div class="ftr">
      © 2026 NeoByte Bank &nbsp;·&nbsp; All rights reserved<br>
      This email was sent because you have an account with NeoByte Bank.<br>
      <span style="color:#333">If you did not request this, please disregard it.</span>
    </div>
  </div>
</body>
</html>`;
}

function buildWelcomeEmail(to: string, data: EmailPayload['data']) {
  const name = data.name || data.username || 'Client';
  const siteUrl = data.siteUrl || 'https://neobytebank.replit.app';
  return {
    from: `"NeoByte Bank" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Welcome to NeoByte Bank — Account Activated',
    html: wrap(`
      <div class="card">
        <span class="badge">Account Activated</span>
        <h1>Welcome to NeoByte Bank</h1>
        <p class="sub">Your identity has been verified and deployed</p>
        <p>Hello <span class="hl">${name}</span>,</p>
        <p>Your authenticated profile has been successfully registered on our secure servers. You now have full access to our prepaid virtual card marketplace.</p>
        <hr>
        <p>Browse our catalog of premium virtual cards and make your first purchase today:</p>
        <div style="text-align:center">
          <a href="${siteUrl}" class="btn">Visit Prepaid Portal →</a>
        </div>
        <hr>
        <p style="font-size:12px;color:${MUTED}">Your account credentials are encrypted and stored securely. Never share your login password with anyone.</p>
      </div>
    `),
  };
}

function buildPurchaseEmail(to: string, data: EmailPayload['data']) {
  const name = data.name || data.cardHolder || 'Client';
  const orderId = data.orderId || Date.now().toString().slice(-8).toUpperCase();
  return {
    from: `"NeoByte Bank" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Order Confirmed — ${data.cardName || 'Virtual Card'} #${orderId}`,
    html: wrap(`
      <div class="card">
        <span class="badge">Order Confirmed</span>
        <h1>Purchase Confirmation</h1>
        <p class="sub">Your order has been received and is being processed</p>
        <p>Hello <span class="hl">${name}</span>,</p>
        <p>Thank you for your order. Your payment has been received and your virtual card is being provisioned. You will receive another email once your card is fully activated.</p>
        <hr>
        <p class="section-label">Order Summary</p>
        <table>
          <tr><td class="lbl">Order ID</td><td class="val">#${orderId}</td></tr>
          <tr><td class="lbl">Product</td><td class="val">${data.cardName || data.cardBrand || 'Virtual Card'}</td></tr>
          <tr><td class="lbl">Brand</td><td class="val">${data.cardBrand || '—'}</td></tr>
          <tr><td class="lbl">Account Holder</td><td class="val">${data.cardHolder || '—'}</td></tr>
          <tr><td class="lbl">Card Limit</td><td class="val-accent">$${data.limit?.toLocaleString() ?? '—'} USD</td></tr>
          <tr><td class="lbl">Amount Paid</td><td class="val-accent" style="font-size:14px;font-weight:800">$${data.price?.toFixed(2) ?? '0.00'}</td></tr>
          <tr style="border-bottom:none"><td class="lbl" style="border-bottom:none">Purchase Date</td><td class="val" style="border-bottom:none">${data.purchaseDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>
        </table>
        <hr>
        <p style="font-size:12px;color:${MUTED}">Estimated activation time: <span style="color:${TEXT}">within 5 minutes</span> of payment confirmation. Your full card credentials will be emailed upon activation.</p>
      </div>
    `),
  };
}

function buildActivationEmail(to: string, data: EmailPayload['data']) {
  const name = data.cardHolder || data.name || 'Client';
  return {
    from: `"NeoByte Bank" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your NeoByte Card Is Now Active — ${data.cardBrand || 'Virtual Card'}`,
    html: wrap(`
      <div class="card">
        <span class="badge badge-green">Card Active</span>
        <h1>Your Card Is Live</h1>
        <p class="sub">Your virtual card credentials are ready to use</p>
        <p>Hello <span class="hl">${name}</span>,</p>
        <p>Your secure virtual prepaid card has been successfully validated, activated, and is now fully operational. Please maintain strict confidentiality regarding your credentials.</p>
        <hr>
        <p class="section-label">Card Credentials</p>
        <table>
          <tr><td class="lbl">Account Holder</td><td class="val">${data.cardHolder || '—'}</td></tr>
          <tr><td class="lbl">Card Brand</td><td class="val">${data.cardBrand || '—'}</td></tr>
          <tr><td class="lbl">Card Number</td><td class="val-accent" style="font-size:13px;letter-spacing:2px">${data.cardNumber || '—'}</td></tr>
          <tr><td class="lbl">Expiration</td><td class="val">${data.expiry || '—'}</td></tr>
          <tr><td class="lbl">CVV</td><td class="val-accent" style="font-size:14px;font-weight:800">${data.cvv || '—'}</td></tr>
          <tr style="border-bottom:none"><td class="lbl" style="border-bottom:none">Credit Limit</td><td class="val-accent" style="border-bottom:none;font-size:14px;font-weight:800">$${data.limit?.toLocaleString() ?? '—'} USD/Month</td></tr>
        </table>
        <div class="warn">
          <p>⚠ Keep these credentials confidential. Never share your CVV or card number in public channels. NeoByte Bank will never ask for your credentials via phone or chat.</p>
        </div>
      </div>
    `),
  };
}

function buildAbandonedCartEmail(to: string, data: EmailPayload['data']) {
  const name = data.name || data.username || 'Client';
  const siteUrl = data.siteUrl || 'https://neobytebank.replit.app';
  const cardName = data.cardName || 'Virtual Credit Card';
  
  return {
    from: `"NeoByte Bank" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Complete Your Order — Your Virtual Card is Reserved',
    html: wrap(`
      <div class="card">
        <span class="badge">Pending Payment</span>
        <h1>Complete Your Checkout</h1>
        <p class="sub">Your ${cardName} is reserved and waiting for you.</p>
        <p>Hello <span class="hl">${name}</span>,</p>
        <p>We noticed you started an order for your new virtual credit card but haven't completed the payment yet.</p>
        <p>Your card has been securely reserved. Once payment is confirmed, your card details will be securely dispatched to this email address within 5 minutes.</p>
        
        <div class="warn" style="margin: 24px 0; background: rgba(173,255,47,.05); border: 1px solid rgba(173,255,47,.2);">
          <p style="color: ${'#adff2f'}; margin: 0; font-weight: 600;">⚡ Ready for instant activation upon payment completion.</p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="${siteUrl}" class="btn">Complete Payment Now</a>
        </div>
      </div>
    `)
  };
}

export async function sendEmailHandler(req: any, res: any): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload: EmailPayload = req.body;

  if (!payload?.type || !payload?.to) {
    res.status(400).json({ error: 'Missing required fields: type, to' });
    return;
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('[send-email] Missing GMAIL_USER or GMAIL_APP_PASSWORD');
    res.status(500).json({ error: 'Email service not configured — add GMAIL_USER and GMAIL_APP_PASSWORD secrets' });
    return;
  }

  try {
    const transporter = getTransporter();
    let mailOptions: nodemailer.SendMailOptions;

    switch (payload.type) {
      case 'welcome':
        mailOptions = buildWelcomeEmail(payload.to, payload.data || {});
        break;
      case 'purchase_confirmation':
        mailOptions = buildPurchaseEmail(payload.to, payload.data || {});
        break;
      case 'card_activation':
        mailOptions = buildActivationEmail(payload.to, payload.data || {});
        break;
      case 'abandoned_cart':
        mailOptions = buildAbandonedCartEmail(payload.to, payload.data || {});
        break;
      default:
        res.status(400).json({ error: `Unknown email type: ${payload.type}` });
        return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`[send-email] ✓ ${payload.type} → ${payload.to}`);
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[send-email] Error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to send email' });
  }
}

export default sendEmailHandler;
