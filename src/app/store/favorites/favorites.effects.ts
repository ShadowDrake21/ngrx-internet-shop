import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { FavoritesService } from '@app/core/services/favorites.service';
import { ProductService } from '@app/core/services/product.service';

import * as FavoritesActions from '../favorites/favorites.action';
import * as FavoritesSelectors from '../favorites/favorites.selectors';
import * as UserSelectors from '../user/user.selectors';

import { catchError, exhaustMap, map, of, switchMap, take } from 'rxjs';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppState>);
  private favoritesService = inject(FavoritesService);
  private productsService = inject(ProductService);

  loadAllFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadAllFavorites),
      switchMap(() => this.store.select(UserSelectors.selectEmail)),
      exhaustMap((email) =>
        this.favoritesService.getAllFavoritesProducts(email!).pipe(
          map((favorites) =>
            FavoritesActions.loadAllFavoritesSuccess({ products: favorites })
          ),
          catchError((error) =>
            of(
              FavoritesActions.loadAllFavoritesFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );

  addToFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addToFavorites),
      switchMap(({ favoriteId, recordName }) =>
        this.productsService
          .getSingleProductById(favoriteId)
          .pipe(map((newProduct) => ({ recordName, newProduct })))
      ),
      switchMap(({ newProduct, recordName }) =>
        this.store.select(UserSelectors.selectEmail).pipe(
          take(1),
          map((email) => ({ email, newProduct, recordName }))
        )
      ),
      switchMap(({ email, newProduct, recordName }) =>
        this.favoritesService
          .setFavoriteProduct(newProduct, email!, recordName)
          .pipe(
            switchMap(() =>
              this.store
                .select(FavoritesSelectors.selectProducts)
                .pipe(map((products) => [...products, newProduct]))
            ),
            map((products) =>
              FavoritesActions.addToFavoritesSuccess({ products })
            ),
            catchError((error) =>
              of(
                FavoritesActions.addToFavoritesFailure({
                  errorMessage: error.message,
                })
              )
            )
          )
      )
    )
  );

  removeFromFavorites$ = createEffect(() =>
    this.actions$.pipe(ofType(FavoritesActions.removeFromFavorites))
  );
}
