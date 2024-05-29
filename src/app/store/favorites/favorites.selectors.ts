// angular stuff
import { createSelector } from '@ngrx/store';

// created ngrx stuff
import { AppState } from '../app.state';
import { FavoritesState } from './favorites.reducer';

export const selectFavoritesState = (state: AppState) => state.favorites;

export const selectFavorites = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.products
);
export const selectErrorMessage = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.errorMessage
);
