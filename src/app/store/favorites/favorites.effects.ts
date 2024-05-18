import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { FavoritesService } from '@app/core/services/favorites.service';
import { ProductService } from '@app/core/services/product.service';

import * as FavoritesActions from '../favorites/favorites.action';
import * as FavoritesSelectors from '../favorites/favorites.selectors';
import * as UserSelectors from '../user/user.selectors';

import {
  catchError,
  concatMap,
  exhaustMap,
  map,
  of,
  switchMap,
  take,
} from 'rxjs';
import { IFavoriteProduct } from '@app/shared/models/favorite.model';
import { IProduct } from '@app/shared/models/product.model';

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
            FavoritesActions.loadAllFavoritesSuccess({ favorites })
          ),
          catchError((error) =>
            of(
              FavoritesActions.loadAllFavoritesFailure({
                errorMessage: `Error during favorite products loading: ${error.message}`,
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
                this.favoritesService
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
            this.favoritesService
              .deleteFavoriteProduct(email!, favoriteId)
              .pipe(
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
                catchError((error) =>
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

  // removeFromFavorites$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(FavoritesActions.removeFromFavorites),
  //     switchMap(({ favoriteId }) =>
  //       this.store.select(UserSelectors.selectEmail).pipe(
  //         take(1),
  //         map((email) => ({ email, favoriteId }))
  //       )
  //     ),
  //     switchMap(({ email, favoriteId }) =>
  //       this.favoritesService.deleteFavoriteProduct(email!, favoriteId).pipe(
  //         switchMap(() =>
  //           this.store
  //             .select(FavoritesSelectors.selectFavorites)
  //             .pipe(
  //               map((favorites) =>
  //                 favorites.filter(
  //                   (favorite) => favorite.favoriteId !== favoriteId
  //                 )
  //               )
  //             )
  //         ),
  //         map((favorites) =>
  //           FavoritesActions.addToFavoritesSuccess({ favorites })
  //         ),
  //         catchError((error) =>
  //           of(
  //             FavoritesActions.addToFavoritesFailure({
  //               errorMessage: error.message,
  //             })
  //           )
  //         )
  //       )
  //     )
  //   )
  // );
}
