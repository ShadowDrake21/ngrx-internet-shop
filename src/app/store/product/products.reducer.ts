// angular stuff
import { createReducer, on } from '@ngrx/store';

// interfaces
import { IProduct } from '@models/product.model';

// created ngrx stuff
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
  on(ProductActions.loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    errorMessage: null,
  })),
  on(ProductActions.loadProductsFailure, (state, { errorMessage }) => ({
    ...state,
    products: [],
    errorMessage,
  })),
  on(ProductActions.setSingleProduct, (state, { product }) => ({
    ...state,
    products: [product],
    errorMessage: null,
  })),
  on(ProductActions.filterProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    errorMessage: null,
  })),
  on(ProductActions.filterProductsFailure, (state, { errorMessage }) => ({
    ...state,
    products: [],
    errorMessage,
  })),
  on(ProductActions.searchProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    errorMessage: null,
  })),
  on(ProductActions.searchProductsFailure, (state, { errorMessage }) => ({
    ...state,
    products: [],
    errorMessage,
  })),
  on(ProductActions.loadSingleProductByIdSuccess, (state, { product }) => ({
    ...state,
    products: [product],
    errorMessage: null,
  })),
  on(
    ProductActions.loadSingleProductByIdFailure,
    (state, { errorMessage }) => ({
      ...state,
      products: [],
      errorMessage,
    })
  ),
  on(ProductActions.loadProductsByCategorySuccess, (state, { products }) => ({
    ...state,
    products,
    errorMessage: null,
  })),
  on(
    ProductActions.loadProductsByCategoryFailure,
    (state, { errorMessage }) => ({
      ...state,
      products: [],
      errorMessage,
    })
  ),
  on(ProductActions.clearProductState, () => ({
    products: [],
    errorMessage: null,
  }))
);
