import { IFavoriteProduct } from '@app/shared/models/favorite.model';
import { IProduct } from '@app/shared/models/product.model';
import { createAction, props } from '@ngrx/store';

export const loadAllFavorites = createAction(
  '[Favorites Component] LoadAllFavorites'
);
export const loadAllFavoritesSuccess = createAction(
  '[Favorites Component] LoadAllFavoritesSuccess',
  props<{ favorites: IProduct[] }>()
);
export const loadAllFavoritesFailure = createAction(
  '[Favorites Component] LoadAllFavoritesFailure',
  props<{ errorMessage: string }>()
);

export const addToFavorites = createAction(
  '[Favorites Component] AddToFavorites',
  props<{ productId: number; recordName: string }>()
);
export const addToFavoritesSuccess = createAction(
  '[Favorites Component] AddToFavoritesSuccess',
  props<{ favorites: IProduct[] }>()
);
export const addToFavoritesFailure = createAction(
  '[Favorites Component] AddToFavoritesFailure',
  props<{ errorMessage: string }>()
);

export const removeFromFavorites = createAction(
  '[Favorites Component] RemoveProductFromFavorites',
  props<{ favoriteId: string }>()
);
export const removeFromFavoritesSuccess = createAction(
  '[Favorites Component] RemoveFromFavoritesSuccess',
  props<{ favorites: IProduct[] }>()
);
export const removeFromFavoritesFailure = createAction(
  '[Favorites Component] RemoveFromFavoritesFailure',
  props<{ errorMessage: string }>()
);
export const clearFavoritesState = createAction(
  '[Favorites Component] ClearFavoritesState'
);
