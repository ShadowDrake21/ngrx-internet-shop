import Stripe from 'stripe';
import { createReducer, on } from '@ngrx/store';

import * as PurchaseActions from '@store/purchase/purchase.actions';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';
import { IProduct } from '@app/shared/models/product.model';

export interface PurchaseState {
  customer: Stripe.Customer | null;
  transactions: ISupplementedCharge[];
  errorMessage: string | null;
}
export const initialPurchaseState: PurchaseState = {
  customer: null,
  transactions: [],
  errorMessage: null,
};

export const purchaseReducer = createReducer(
  initialPurchaseState,
  on(PurchaseActions.createCustomerSuccess, (state, { customer }) => ({
    ...state,
    customer,
    transactions: [],
    errorMessage: null,
  })),
  on(PurchaseActions.createCustomerFailure, (state, { errorMessage }) => ({
    ...state,
    customer: null,
    transactions: [],
    errorMessage,
  })),
  on(PurchaseActions.getCustomerSuccess, (state, { customer }) => {
    console.log('state before changings', state);
    const newState = { ...state, customer };
    console.log('state after changings', state);
    return newState;
  }),
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

  on(PurchaseActions.updateCustomerFailure, (state, { errorMessage }) => ({
    ...state,
    customer: state.customer,
    transactions: state.transactions,
    errorMessage,
  })),
  on(PurchaseActions.getAllTransactionsFailure, (state, { errorMessage }) => {
    const transactionsStr = sessionStorage.getItem('transactions');
    let transactions: ISupplementedCharge[] = [];
    if (transactionsStr) {
      transactions = JSON.parse(transactionsStr);
    }
    return {
      ...state,
      customer: state.customer,
      transactions,
      errorMessage,
    };
  }),
  on(PurchaseActions.browserReload, (state, { customer }) => ({
    ...state,
    customer,
    transactions: [],
    errorMessage: null,
  })),
  on(PurchaseActions.clearPurchaseState, (state) => ({
    customer: null,
    transactions: [],
    errorMessage: null,
  }))
);
