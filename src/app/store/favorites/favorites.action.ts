import { createAction, props } from '@ngrx/store';

export const addToFavorites = createAction(
  '[Favorites Component] AddToFavorites',
  props<{ favorite: number }>()
);
export const removeProductFromFavorites = createAction(
  '[Favorites Component] RemoveProductFromFavorites',
  props<{ favorite: number }>()
);
