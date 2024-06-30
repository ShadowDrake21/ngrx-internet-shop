// angular stuff
import Stripe from 'stripe';
import { createReducer, on } from '@ngrx/store';

// created ngrx stuff
import * as PurchaseActions from '@store/purchase/purchase.actions';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';

export interface PurchaseState {
  loading: boolean;
  customer: Stripe.Customer | null;
  transactions: ISupplementedCharge[];
  errorMessage: string | null;
}
export const initialPurchaseState: PurchaseState = {
  loading: false,
  customer: null,
  transactions: [],
  errorMessage: null,
};

export const purchaseReducer = createReducer(
  initialPurchaseState,
  on(PurchaseActions.startCheckoutLoading, (state) => ({
    ...state,
    loading: true,
  })),
  on(PurchaseActions.endCheckoutLoading, (state) => ({
    ...state,
    loading: false,
  })),
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
    ...state,
    customer: null,
    transactions: [],
    errorMessage: null,
  }))
);
