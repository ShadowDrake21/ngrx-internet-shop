import Stripe from 'stripe';
import { IProduct } from './product.model';
import { IReducedUnsplashImage } from './unsplash.model';
import { ICard } from './card.model';

export interface ICheckoutInit {
  email: string;
  products: IProduct[];
  deliveryAddress?: IShipping;
  paymentMethodId?: string;
}

export interface IPurchaseUpdate {
  name?: string;
  description?: string;
  address?: IAddress;
  shipping?: IShipping;
}

export interface IShipping {
  id?: string;
  background?: IReducedUnsplashImage;
  name: string;
  phone: string;
  address: IAddress;
}

export interface IAddress {
  country: string;
  city: string;
  line1: string;
  line2: string;
  postal_code: string;
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

export interface IUserTransactionsData {
  count: number;
  price: number;
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
