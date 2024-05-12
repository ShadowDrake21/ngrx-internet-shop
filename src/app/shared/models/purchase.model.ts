import Stripe from 'stripe';
import { IProduct } from './product.model';

export interface ICheckoutInit {
  email: string;
  products: IProduct[];
}

export interface IPurchaseUpdate {
  name?: string;
  description?: string;
  shipping?: {
    name: string;
    phone: string;
    address: {
      country: string;
      city: string;
      line1: string;
      line2: string;
      postal_code: string;
    };
  };
}

export interface ISupplementedTransactions {
  transactions: ISupplementedCharge[];
  hasMore: boolean;
}

export interface ISupplementedCharge {
  charge: Stripe.Charge;
  products: ISupplementedChargeProduct[];
}

export interface ISupplementedChargeProduct {
  product: Stripe.Product;
  price: Stripe.Price;
  quantity: number;
}

export interface ITransactionDataDB {
  payment_intent: string;
  productsIds: ITransactionIds[];
}

export interface ITransactionIds {
  price_id: string;
  product_id: string;
  quantity: number;
}
