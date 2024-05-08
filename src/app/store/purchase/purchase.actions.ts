import { IProduct } from '@app/shared/models/product.model';
import { IPurchaseUpdate } from '@app/shared/models/purchase.model';
import { createAction, props } from '@ngrx/store';
import { PaymentMethod } from '@stripe/stripe-js';
import Stripe from 'stripe';

export const makeCheckout = createAction(
  '[Checkout Component] MakeCheckout',
  props<{ products: IProduct[] }>()
);
export const makeCheckoutSuccess = createAction(
  '[Checkout Component] MakeCheckoutSuccess',
  props<{ resultMessage: string }>()
);
export const makeCheckoutFailure = createAction(
  '[Checkout Component] MakeCheckoutFailure',
  props<{ errorMessage: string }>()
);

export const getCustomer = createAction(
  '[Checkout Component] GetCustomer',
  props<{ email: string }>()
);
export const getCustomerSuccess = createAction(
  '[Checkout Component] GetCustomerSuccess',
  props<{ customer: Stripe.Customer }>()
);
export const getCustomerFailure = createAction(
  '[Checkout Component] GetCustomerFailure',
  props<{ errorMessage: string }>()
);

export const updateCustomer = createAction(
  '[Checkout Component] UpdateCustomer',
  props<{ customerId: string; updateObject: IPurchaseUpdate }>()
);
export const updateCustomerSuccess = createAction(
  '[Checkout Component] UpdateCustomerSuccess',
  props<{ customer: Stripe.Customer }>()
);
export const updateCustomerFailure = createAction(
  '[Checkout Component] UpdateCustomerFailure',
  props<{ errorMessage: string }>()
);

export const getAllTransactions = createAction(
  '[Checkout Component] GetAllTransactions',
  props<{ customerId: string }>()
);
export const getAllTransactionsSuccess = createAction(
  '[Checkout Component] GetAllTransactionsSuccess',
  props<{ transactions: Stripe.Charge[] }>()
);
export const getAllTransactionsFailure = createAction(
  '[Checkout Component] GetAllTransactionsFailure',
  props<{ errorMessage: string }>()
);

export const getCustomerPaymentMethods = createAction(
  '[Checkout Component] GetCustomerPaymentMethods',
  props<{ customerId: string }>()
);
export const getCustomerPaymentMethodsSuccess = createAction(
  '[Checkout Component] GetCustomerPaymentMethodsSuccess',
  props<{ paymentMethods: PaymentMethod[] }>()
);
export const getCustomerPaymentMethodsFailure = createAction(
  '[Checkout Component] GetCustomerPaymentMethodsFailure',
  props<{ customerId: string }>()
);

// shipping and so on
