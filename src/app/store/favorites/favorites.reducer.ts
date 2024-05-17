import { createReducer, on } from '@ngrx/store';

// actions
import * as FavoritesActions from './favorites.action';
import { IFavoriteProduct } from '@app/shared/models/favorite.model';
import { IProduct } from '@app/shared/models/product.model';

export interface FavoritesState {
  favorites: IProduct[];
  errorMessage: string | null;
}

export const initialFavoritesState: FavoritesState = {
  favorites: [],
  errorMessage: null,
};

export const favoritesReducer = createReducer(
  initialFavoritesState,
  on(FavoritesActions.loadAllFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    errorMessage: null,
  })),
  on(FavoritesActions.loadAllFavoritesFailure, (state, { errorMessage }) => ({
    ...state,
    favorites: [],
    errorMessage,
  })),
  on(FavoritesActions.addToFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    errorMessage: null,
  })),
  on(FavoritesActions.addToFavoritesFailure, (state, { errorMessage }) => ({
    ...state,
    errorMessage,
  })),
  on(FavoritesActions.removeFromFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    favorites,
    errorMessage: null,
  })),
  on(
    FavoritesActions.removeFromFavoritesFailure,
    (state, { errorMessage }) => ({
      ...state,
      errorMessage,
    })
  )
);
