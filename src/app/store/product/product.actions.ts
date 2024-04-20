import { createAction, props } from '@ngrx/store';
import { IProduct } from '../../shared/models/product.model';
import { IFilterFormObj } from '../../shared/models/forms.model';

export const loadProducts = createAction('[Products Component] LoadProducts');
export const loadProductsSuccess = createAction(
  '[Products Component] LoadProductsSuccess',
  props<{ products: IProduct[] }>()
);
export const loadProductsFailure = createAction(
  '[Products Component] LoadProductsFailure',
  props<{ errorMessage: string }>()
);
export const filterProducts = createAction(
  '[Products Component] FilterProducts',
  props<{ filterData: IFilterFormObj }>()
);
export const filterProductsSuccess = createAction(
  '[Products Component] FilterProductsSuccess',
  props<{ products: IProduct[] }>()
);
export const filterProductsFailure = createAction(
  '[Products Component] FilterProductsFailure',
  props<{ errorMessage: string }>()
);
export const searchProducts = createAction(
  '[Products Component] SearchProducts',
  props<{ searchTerm: string }>()
);
export const searchProductsSuccess = createAction(
  '[Products Component] SearchProductsSuccess',
  props<{ products: IProduct[] }>()
);
export const searchProductsFailure = createAction(
  '[Products Component] SearchProductsFailure',
  props<{ errorMessage: string }>()
);
export const getSingleProductById = createAction(
  '[Products Component] GetSingleProductById',
  props<{ productId: number }>()
);
export const getSingleProductByIdSuccess = createAction(
  '[Products Component] GetSingleProductByIdSuccess',
  props<{ product: IProduct }>()
);
export const getSingleProductByIdFailure = createAction(
  '[Products Component] GetSingleProductByIdFailure',
  props<{ errorMessage: string }>()
);
