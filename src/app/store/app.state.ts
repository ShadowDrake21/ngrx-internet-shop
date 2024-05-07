import { CartState } from './cart/cart.reducer';
import { CategoryState } from './category/category.reducer';
import { FavoritesState } from './favorites/favorites.reducer';
import { ProductState } from './product/products.reducer';
import { PurchaseState } from './purchase/purchase.reducer';
import { UserState } from './user/user.reducer';

export interface AppState {
  user: UserState;
  product: ProductState;
  cart: CartState;
  category: CategoryState;
  favorites: FavoritesState;
  purchase: PurchaseState;
}
