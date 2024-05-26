import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductService } from '@app/core/services/product.service';

import * as FavoritesActions from './favorites.actions';
import * as FavoritesSelectors from '../favorites/favorites.selectors';
import * as UserSelectors from '../user/user.selectors';

import {
  catchError,
  concatMap,
  exhaustMap,
  filter,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { DatabaseService } from '@app/core/services/database.service';
import { FirebaseError } from 'firebase/app';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppState>);
  private databaseService = inject(DatabaseService);
  private productsService = inject(ProductService);

  loadAllFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadAllFavorites),
      switchMap(() => this.store.select(UserSelectors.selectEmail)),
      filter((email) => !!email),
      exhaustMap((email) =>
        this.databaseService.getAllFavoritesProducts(email!).pipe(
          map((favorites) =>
            FavoritesActions.loadAllFavoritesSuccess({ favorites })
          ),
          catchError((error: FirebaseError) =>
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
      concatMap(({ productId, recordName }) =>
        this.productsService.getSingleProductById(productId).pipe(
          map((product) => ({ ...product, favoriteId: recordName })),
          concatMap((favoriteItem) =>
            this.store.select(UserSelectors.selectEmail).pipe(
              take(1),
              concatMap((email) =>
                this.databaseService
                  .setFavoriteProduct(favoriteItem, email!, recordName)
                  .pipe(
                    switchMap(() =>
                      this.store
                        .select(FavoritesSelectors.selectFavorites)
                        .pipe(
                          take(1),
                          map((favorites) => [...favorites, favoriteItem]),
                          map((completeFavorites) =>
                            FavoritesActions.addToFavoritesSuccess({
                              favorites: completeFavorites,
                            })
                          )
                        )
                    ),
                    catchError((error: FirebaseError) =>
                      of(
                        FavoritesActions.addToFavoritesFailure({
                          errorMessage: error.message,
                        })
                      )
                    )
                  )
              )
            )
          )
        )
      )
    )
  );

  removeFromFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFromFavorites),
      concatMap(({ favoriteId }) => {
        return this.store.select(UserSelectors.selectEmail).pipe(
          take(1),
          concatMap((email) =>
            this.databaseService.deleteFavoriteProduct(email!, favoriteId).pipe(
              switchMap(() =>
                this.store.select(FavoritesSelectors.selectFavorites).pipe(
                  take(1),
                  map((favorites) => {
                    return favorites.filter(
                      (favorite) => favorite.favoriteId !== favoriteId
                    );
                  }),
                  map((completeFavorites) =>
                    FavoritesActions.removeFromFavoritesSuccess({
                      favorites: completeFavorites,
                    })
                  )
                )
              ),
              catchError((error: FirebaseError) =>
                of(
                  FavoritesActions.removeFromFavoritesFailure({
                    errorMessage: error.message,
                  })
                )
              )
            )
          )
        );
      })
    )
  );
}
