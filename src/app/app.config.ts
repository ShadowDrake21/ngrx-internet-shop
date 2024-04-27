// angular stuff
import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';

// routes
import { routes } from './app.routes';

// ngrx reducers
import { productReducer } from './store/product/products.reducer';
import { cartReducer } from './store/cart/cart.reducer';
import { categoryReducer } from './store/category/category.reducer';
import { favoritesReducer } from './store/favorites/favorites.reducer';
import { userReducer } from './store/user/user.reducer';

// ngrx effects
import { ProductEffects } from './store/product/product.effects';
import { CategoryEffects } from './store/category/category.effects';
import { UserEffects } from './store/user/user.effects';

// environment
import { environment } from '../environments/environment.development';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({
      product: productReducer,
      cart: cartReducer,
      category: categoryReducer,
      favorites: favoritesReducer,
      user: userReducer,
      router: routerReducer,
    }),
    provideEffects([ProductEffects, CategoryEffects, UserEffects]),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth()),
      provideDatabase(() => getDatabase()),
    ]),
  ],
};
