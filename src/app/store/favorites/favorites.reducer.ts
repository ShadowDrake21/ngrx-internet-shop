import { createReducer, on } from '@ngrx/store';
import * as FavoritesActions from './favorites.action';

export interface FavoritesState {
  favorites: number[];
}

export const initialFavoritesState: FavoritesState = {
  favorites: [],
};

export const favoritesReducer = createReducer(
  initialFavoritesState,
  on(FavoritesActions.addToFavorites, (state, { favorite }) => ({
    ...state,
    favorites: [...state.favorites, favorite],
  })),
  on(FavoritesActions.removeProductFromFavorites, (state, { favorite }) => {
    const updatedFavorites = state.favorites.filter(
      (favoriteId) => favorite !== favoriteId
    );

    return {
      ...state,
      favorites: updatedFavorites,
    };
  })
);
