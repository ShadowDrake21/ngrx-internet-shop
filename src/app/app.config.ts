import {
  ApplicationConfig,
  importProvidersFrom,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient } from '@angular/common/http';
import { productReducer } from './store/product/products.reducer';
import { ProductEffects } from './store/product/product.effects';
import { cartReducer } from './store/cart/cart.reducer';
import { provideAnimations } from '@angular/platform-browser/animations';
import { favoritesReducer } from './store/favorites/favorites.reducer';
import { categoryReducer } from './store/category/category.reducer';
import { CategoryEffects } from './store/category/category.effects';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';

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
    }),
    provideEffects([ProductEffects, CategoryEffects]),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth()),
      provideDatabase(() => getDatabase()),
    ]),
  ],
};
