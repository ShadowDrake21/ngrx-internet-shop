import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { FavoritesState } from './favorites.reducer';

export const selectFavoritesState = (state: AppState) => state.favorites;

export const selectFavorites = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.favorites
);
