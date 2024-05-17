import { createReducer, on } from '@ngrx/store';

// actions
import * as FavoritesActions from './favorites.action';
import { IProduct } from '@app/shared/models/product.model';
import { errorMessages } from '@app/pages/user-information/children/purchases/components/customer-information/constants/errors.constants';

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
  on(FavoritesActions.loadAllFavoritesSuccess, (state, { products }) => ({
    ...state,
    products,
  })),
  on(FavoritesActions.loadAllFavoritesFailure, (state, { errorMessage }) => ({
    ...state,
    errorMessage,
  }))
  // on(FavoritesActions.addToFavorites, (state, { favoriteId }) => ({
  //   ...state,
  //   favorites: [...state.favorites, favorite],
  // })),
  // on(FavoritesActions.removeProductFromFavorites, (state, { favoriteId }) => {
  //   const updatedFavorites = state.favorites.filter(
  //     (favoriteId) => favorite !== favoriteId
  //   );

  //   return {
  //     ...state,
  //     favorites: updatedFavorites,
  //   };
  // })
);
