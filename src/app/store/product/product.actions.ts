import { createAction, props } from '@ngrx/store';
import { IProduct } from '../../shared/models/product.model';

export const loadProduct = createAction('[Products Component] loadProducts');
export const loadProductSuccess = createAction(
  '[Products Component] loadProductsSuccess',
  props<{ products: IProduct[] }>()
);
export const loadProductFailure = createAction(
  '[Products Component] loadProductsFailure',
  props<{ errorMessage: string }>()
);
