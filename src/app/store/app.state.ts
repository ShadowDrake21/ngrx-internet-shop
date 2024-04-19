import { CartState } from './cart/cart.reducer';
import { FavoritesState } from './favorites/favorites.reducer';
import { ProductState } from './product/products.reducer';

export interface AppState {
  product: ProductState;
  cart: CartState;
  favorites: FavoritesState;
}
