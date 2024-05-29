// angular stuff
import { createFeatureSelector, createSelector } from '@ngrx/store';

// created ngrx stuff
import { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartProducts = createSelector(
  selectCartState,
  (state: CartState) => state.products
);
export const selectCartTotalPrice = createSelector(
  selectCartState,
  (state: CartState) => state.totalPrice
);
