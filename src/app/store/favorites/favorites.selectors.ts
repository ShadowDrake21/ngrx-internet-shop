import { createSelector } from '@ngrx/store';

// states
import { AppState } from '../app.state';
import { FavoritesState } from './favorites.reducer';

export const selectFavoritesState = (state: AppState) => state.favorites;

export const selectProducts = createSelector(
  selectFavoritesState,
  (state: FavoritesState) => state.products
);
