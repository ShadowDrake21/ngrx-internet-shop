import { createReducer, on } from '@ngrx/store';
import { IProduct } from '../../shared/models/product.model';
import * as ProductActions from './product.actions';

export interface ProductState {
  products: IProduct[];
  errorMessage: string | null;
}

export const initialProductState: ProductState = {
  products: [],
  errorMessage: null,
};

export const productReducer = createReducer(
  initialProductState,
  on(ProductActions.loadProductSuccess, (state, { products }) => ({
    ...state,
    products,
    errorMessage: null,
  })),
  on(ProductActions.loadProductFailure, (state, { errorMessage }) => ({
    ...state,
    products: [],
    errorMessage,
  }))
);
