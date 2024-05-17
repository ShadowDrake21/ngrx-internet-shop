import { inject, Injectable } from '@angular/core';
import {
  child,
  Database,
  DataSnapshot,
  get,
  ref,
  remove,
  set,
} from '@angular/fire/database';
import { IProduct } from '@app/shared/models/product.model';

import { from, map, Observable } from 'rxjs';

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
