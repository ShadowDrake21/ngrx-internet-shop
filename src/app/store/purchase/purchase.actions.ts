import { IProduct } from '@app/shared/models/product.model';
import {
  ICheckoutInit,
  IPurchaseUpdate,
  ISupplementedCharge,
} from '@app/shared/models/purchase.model';
import { createAction, props } from '@ngrx/store';
import { PaymentMethod } from '@stripe/stripe-js';
import Stripe from 'stripe';

export const initializeCheckout = createAction(
  '[Checkout Component] InitializeCheckout',
  props<{ data: ICheckoutInit }>()
);

export const createCustomer = createAction(
  '[Checkout Component] CreateCustomer',
  props<{ email: string }>()
);
export const createCustomerSuccess = createAction(
  '[Checkout Component] CreateCustomerSuccess',
  props<{ customer: Stripe.Customer }>()
);
export const createCustomerFailure = createAction(
  '[Checkout Component] CreateCustomerFailure',
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
  props<{ transactions: ISupplementedCharge[] }>()
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

export const browserReload = createAction(
  '[Checkout Component] BrowserReload',
  props<{ customer: Stripe.Customer }>()
);
export const clearPurchaseState = createAction(
  '[Checkout Component] ClearPurchaseState'
);
