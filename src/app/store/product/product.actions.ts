import { createAction, props } from '@ngrx/store';
import { IProduct } from '../../shared/models/product.model';
import { IFilterFormObj } from '../../shared/models/forms.model';

export const loadProduct = createAction('[Products Component] LoadProducts');
export const loadProductSuccess = createAction(
  '[Products Component] LoadProductsSuccess',
  props<{ products: IProduct[] }>()
);
export const loadProductFailure = createAction(
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
