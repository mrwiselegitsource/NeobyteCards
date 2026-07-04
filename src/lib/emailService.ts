export type EmailType = 'welcome' | 'purchase_confirmation' | 'card_activation' | 'abandoned_cart';

export interface EmailData {
  name?: string;
  username?: string;
  cardName?: string;
  cardNumber?: string;
  cardBrand?: string;
  cardHolder?: string;
  customerName?: string;
  expiry?: string;
  cvv?: string;
  limit?: number;
  price?: number;
  purchaseDate?: string;
  siteUrl?: string;
  paymentMethod?: string;
  orderId?: string;
  imageURL?: string;
  customMessage?: string;
  emailSubject?: string;
}

export async function sendEmail(
  type: EmailType,
  to: string,
  data: EmailData = {}
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[emailService] Failed to send ${type} email:`, err);
      return false;
    }

    console.log(`[emailService] ${type} email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[emailService] Network error sending ${type} email:`, err);
    return false;
  }
}
