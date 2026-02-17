
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; 
  priceUSD: number; // Global Base Price
  discount?: number;
  category: string;
  image: string;
  supplierUrlSecret?: string; // Hidden from customers
  availableCountries: string[]; 
  shippingRates: Record<string, number>; // countryCode -> USD
  reviews?: Review[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StoreSettings {
  stripePublicKey: string;
  applePayMerchantId: string;
  supplierApiKey: string;
  webhookUrl: string;
  whatsappNumber: string;
  paymentLink: string; // رابط الدفع الخاص بالمدير
  bankAccountDetails: string; // تفاصيل الحساب البنكي للتحويل
}

export type View = 'home' | 'cart' | 'checkout' | 'admin';

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  rateToUSD: number;
}
