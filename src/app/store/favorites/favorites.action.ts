import { IProduct } from '@app/shared/models/product.model';
import { createAction, props } from '@ngrx/store';

export const loadAllFavorites = createAction(
  '[Favorites Component] LoadAllFavorites'
);
export const loadAllFavoritesSuccess = createAction(
  '[Favorites Component] LoadAllFavoritesSuccess',
  props<{ products: IProduct[] }>()
);
export const loadAllFavoritesFailure = createAction(
  '[Favorites Component] LoadAllFavoritesFailure',
  props<{ errorMessage: string }>()
);

export const addToFavorites = createAction(
  '[Favorites Component] AddToFavorites',
  props<{ favoriteId: number; recordName: string }>()
);
export const addToFavoritesSuccess = createAction(
  '[Favorites Component] AddToFavoritesSuccess',
  props<{ products: IProduct[] }>()
);
export const addToFavoritesFailure = createAction(
  '[Favorites Component] AddToFavoritesFailure',
  props<{ errorMessage: string }>()
);

export const removeFromFavorites = createAction(
  '[Favorites Component] RemoveProductFromFavorites',
  props<{ favoriteId: number }>()
);
export const removeFromFavoritesSuccess = createAction(
  '[Favorites Component] RemoveFromFavoritesSuccess',
  props<{ products: IProduct[] }>()
);
export const removeFromFavoritesFailure = createAction(
  '[Favorites Component] RemoveFromFavoritesFailure',
  props<{ errorMessage: string }>()
);
