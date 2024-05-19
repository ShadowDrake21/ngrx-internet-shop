import { inject, Injectable } from '@angular/core';
import {
  child,
  Database,
  DataSnapshot,
  equalTo,
  get,
  orderByChild,
  query,
  ref,
  remove,
  set,
} from '@angular/fire/database';
import { IFavoriteProduct } from '@app/shared/models/favorite.model';
import { IProduct } from '@app/shared/models/product.model';
import { ITransactionIds } from '@app/shared/models/purchase.model';

import { from, map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private database = inject(Database);

  getAllFavoritesProducts(email: string): Observable<IProduct[]> {
    return from(
      get(
        child(
          ref(this.database),
          `favorites/${email.replace(/[.$#[\]/]/g, '_')}/`
        )
      )
    ).pipe(
      map((snapshot: DataSnapshot) => {
        let favorites: IProduct[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const favoriteData = childSnapshot.val() as IProduct;
            favorites.push(favoriteData);
          });
        }
        return favorites;
      })
    );
  }

  setFavoriteProduct(
    product: IProduct,
    email: string,
    recordName: string
  ): Observable<void> {
    return from(
      set(
        ref(
          this.database,
          `favorites/${email.replace(/[.$#[\]/]/g, '_')}/${recordName}`
        ),
        product
      )
    );
  }

  searchFavoriteProduct(email: string, id: string) {
    const favoriteProductQuery = query(
      ref(this.database, `favorites/${email.replace(/[.$#[\]/]/g, '_')}/${id}`)
    );

    return from(
      get(favoriteProductQuery).then((snapshot) => {
        if (!snapshot.exists()) {
          return null;
        } else {
          return snapshot.val() as IProduct;
        }
      })
    );

    // return from(get(favoriteProductQuery)).pipe(
    //   switchMap((snapshot) => {
    //     if (!snapshot.exists()) {
    //       return of(null);
    //     }

    //     snapshot.forEach((childSnapshot) => {

    //     })
    //   })
    // );
  }

  deleteFavoriteProduct(email: string, favoriteId: string): Observable<void> {
    return from(
      remove(
        ref(
          this.database,
          `favorites/${email.replace(/[.$#[\]/]/g, '_')}/${favoriteId}`
        )
      )
    );
  }
}
