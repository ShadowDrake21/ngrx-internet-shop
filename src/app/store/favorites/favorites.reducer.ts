import { createReducer, on } from '@ngrx/store';

// actions
import * as FavoritesActions from './favorites.actions';
import { IFavoriteProduct } from '@app/shared/models/favorite.model';
import { IProduct } from '@app/shared/models/product.model';

export interface FavoritesState {
  products: IProduct[];
  errorMessage: string | null;
}

export const initialFavoritesState: FavoritesState = {
  products: [],
  errorMessage: null,
};

export const favoritesReducer = createReducer(
  initialFavoritesState,
  on(FavoritesActions.loadAllFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    products: favorites,
    errorMessage: null,
  })),
  on(FavoritesActions.loadAllFavoritesFailure, (state, { errorMessage }) => ({
    ...state,
    products: [],
    errorMessage,
  })),
  on(FavoritesActions.addToFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    products: favorites,
    errorMessage: null,
  })),
  on(FavoritesActions.addToFavoritesFailure, (state, { errorMessage }) => ({
    ...state,
    errorMessage,
  })),
  on(FavoritesActions.removeFromFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    products: favorites,
    errorMessage: null,
  })),
  on(
    FavoritesActions.removeFromFavoritesFailure,
    (state, { errorMessage }) => ({
      ...state,
      errorMessage,
    })
  ),
  on(FavoritesActions.clearFavoritesState, () => ({
    products: [],
    errorMessage: null,
  }))
);
