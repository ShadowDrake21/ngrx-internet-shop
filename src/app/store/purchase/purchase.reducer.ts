import Stripe from 'stripe';
import { createReducer, on } from '@ngrx/store';

import * as PurchaseActions from '@store/purchase/purchase.actions';

export interface PurchaseState {
  customer: Stripe.Customer | null;
  transactions: Stripe.Charge[];
  errorMessage: string | null;
}
export const initialPurchaseState: PurchaseState = {
  customer: null,
  transactions: [],
  errorMessage: null,
};

export const purchaseReducer = createReducer(
  initialPurchaseState,
  on(PurchaseActions.getCustomerSuccess, (state, { customer }) => ({
    ...state,
    customer,
  })),
  on(PurchaseActions.getCustomerFailure, (state, { errorMessage }) => ({
    ...state,
    customer: null,
    transactions: [],
    errorMessage,
  })),
  on(PurchaseActions.updateCustomerSuccess, (state, { customer }) => ({
    ...state,
    customer,
    transactions: state.transactions,
  })),
  on(PurchaseActions.getAllTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    customer: state.customer,
    transactions,
  })),

  on(
    PurchaseActions.updateCustomerFailure,
    PurchaseActions.getAllTransactionsFailure,
    (state, { errorMessage }) => ({
      ...state,
      customer: state.customer,
      transactions: state.transactions,
      errorMessage,
    })
  )
);
