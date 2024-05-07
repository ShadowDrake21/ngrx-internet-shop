import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PurchaseState } from './purchase.reducer';

export const selectPurchaseState =
  createFeatureSelector<PurchaseState>('purchase');

export const selectCustomer = createSelector(
  selectPurchaseState,
  (state: PurchaseState) => state.customer
);
export const selectTransactions = createSelector(
  selectPurchaseState,
  (state: PurchaseState) => state.transactions
);
export const selectErrorMessage = createSelector(
  selectPurchaseState,
  (state: PurchaseState) => state.errorMessage
);
