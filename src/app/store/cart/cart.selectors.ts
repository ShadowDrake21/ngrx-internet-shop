import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from '../product/products.reducer';
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
