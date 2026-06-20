export type CardBrand = 'Mastercard' | 'Visa' | 'Amex' | 'Discover' | 'Atmos';

export interface PrepaidCard {
  id: string;
  brand: CardBrand;
  name: string;
  price: number;
  originalPrice: number;
  limit: number; // e.g., monthly spending limit
  cardNumber: string; // e.g., "5574 4568 1234 4568" OR "5574 **** **** 7378"
  expiry: string;
  cvv: string;
  accountHolder: string;
  address: string;
  country: string;
  tags: string[];
  color: string; // Tailwind bg styles or gradient definitions
  textHighlight: string; // color highlight class e.g., 'text-lime-400'
  description: string;
  imageURL?: string;
  isUploadedImage?: boolean;
}

export interface User {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isLoggedIn: boolean;
}

export interface PurchasedCard {
  id: string;
  brand: CardBrand;
  name: string;
  price: number;
  limit: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  accountHolder: string;
  purchaseDate: string;
  isFrozen: boolean;
  notes?: string;
  imageURL?: string;
  isUploadedImage?: boolean;
  color?: string;
  status?: 'awaiting_dispatch' | 'active';
  paymentScreenshot?: string | null;
  paymentMethod?: string;
  ownerEmail?: string;
  purchaseTimestamp?: number;
  ownerId?: string;
}

export interface PaymentDetails {
  method: 'Mobile Money' | 'Bitcoin' | 'NeoMail Pay';
  country?: string;
  mobileNumber?: string;
  carrier?: string;
  amount?: number;
  screenshot?: File | string | null;
  transactionHash?: string;
}

export interface SiteImagesConfig {
  headerLogo: string;
  heroBackground: string;
  heroCardsStack: string;
  lightningGraphic: string;
  marketplaceImage: string;
  testimonialAvatar: string;
  getStartedGraphic: string;
  footerLogo: string;
}

