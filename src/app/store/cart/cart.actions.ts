import { createAction, props } from '@ngrx/store';

// interfaces
import { IProduct } from '../../shared/models/product.model';

export const addToCart = createAction(
  '[Cart Component] AddToCart',
  props<{ product: IProduct }>()
);
export const increaseCountProduct = createAction(
  '[Cart Component] IncreaseCountProduct',
  props<{ productId: number }>()
);
export const decreaseCountProduct = createAction(
  '[Cart Component] DecreaseCountProduct',
  props<{ productId: number }>()
);
export const removeProductFromCart = createAction(
  '[Cart Component] RemoveProductFromCart',
  props<{ productId: number }>()
);
export const clearCartState = createAction('[Cart Component] ClearCartState');
