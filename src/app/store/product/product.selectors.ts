import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './products.reducer';

export const selectProductState =
  createFeatureSelector<ProductState>('product');

export const selectProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

export const selectErrorMessage = createSelector(
  selectProductState,
  (state: ProductState) => state.errorMessage
);