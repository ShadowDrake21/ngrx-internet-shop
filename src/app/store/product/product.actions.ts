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
export const loadSingleProductById = createAction(
  '[Products Component] LoadSingleProductById',
  props<{ productId: number }>()
);
export const loadSingleProductByIdSuccess = createAction(
  '[Products Component] LoadSingleProductByIdSuccess',
  props<{ product: IProduct }>()
);
export const loadSingleProductByIdFailure = createAction(
  '[Products Component] LoadSingleProductByIdFailure',
  props<{ errorMessage: string }>()
);
export const loadProductsByCategory = createAction(
  '[Products Component] LoadProductsByCategory',
  props<{ categoryId: number }>()
);
export const loadProductsByCategorySuccess = createAction(
  '[Products Component] LoadProductsByCategorySuccess',
  props<{ products: IProduct[] }>()
);
export const loadProductsByCategoryFailure = createAction(
  '[Products Component] LoadProductsByCategoryFailure',
  props<{ errorMessage: string }>()
);
