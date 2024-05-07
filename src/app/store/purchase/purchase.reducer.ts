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
  on(PurchaseActions.getAllTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    customer: state.customer,
    transactions,
  })),
  on(
    PurchaseActions.getCustomerFailure,
    PurchaseActions.getAllTransactionsFailure,
    (state, { errorMessage }) => ({
      ...state,
      customer: state.customer,
      transactions: state.transactions,
      errorMessage,
    })
  )
);
