import { inject, Injectable } from '@angular/core';
import {
  child,
  Database,
  DataSnapshot,
  get,
  ref,
  remove,
  update,
} from '@angular/fire/database';
import { ICard } from '@app/shared/models/card.model';
import { IProduct } from '@app/shared/models/product.model';
import { IShipping } from '@app/shared/models/purchase.model';
import { query, set } from 'firebase/database';
import { from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private database = inject(Database);

  setDeliveryRecord(
    shipping: IShipping,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return from(
      set(
        ref(
          this.database,
          `customers/${customerId}/deliveryRecords/${recordName}`
        ),
        shipping
      )
    );
  }

  getAllDeliveryRecords(customerId: string): Observable<IShipping[]> {
    return from(
      get(child(ref(this.database), `customers/${customerId}/deliveryRecords/`))
    ).pipe(
      map((snaphot: DataSnapshot) => {
        let deliveryRecords: IShipping[] = [];
        if (snaphot.exists()) {
          snaphot.forEach((childSnapshot) => {
            const shippingData = childSnapshot.val() as IShipping;
            deliveryRecords.push(shippingData);
          });
        }
        return deliveryRecords;
      })
    );
  }

  deleteDeliveryRecord(customerId: string, recordId: string): Observable<void> {
    return from(
      remove(
        ref(
          this.database,
          `customers/${customerId}/deliveryRecords/${recordId}`
        )
      )
    );
  }

  setCard(
    card: ICard,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return from(
      set(
        ref(this.database, `customers/${customerId}/cards/${recordName}`),
        card
      )
    );
  }

  getAllCards(customerId: string): Observable<ICard[]> {
    return from(
      get(child(ref(this.database), `customers/${customerId}/cards/`))
    ).pipe(
      map((snaphot: DataSnapshot) => {
        let cards: ICard[] = [];
        if (snaphot.exists()) {
          snaphot.forEach((childSnapshot) => {
            const cardData = childSnapshot.val() as ICard;
            cards.push(cardData);
          });
        }
        return cards;
      })
    );
  }

  deleteCard(customerId: string, cardId: string): Observable<void> {
    return from(
      remove(ref(this.database, `customers/${customerId}/cards/${cardId}`))
    );
  }

  setLastViewedProduct(email: string, productName: string) {
    return from(
      set(
        ref(
          this.database,
          `basic-info/${email.replace(/[.$#[\]/]/g, '_')}/lastViewedProduct`
        ),
        { product: productName }
      )
    );
  }

  getLastViewedProduct(email: string): Observable<string> {
    if (!email) {
      return of('');
    }
    return from(
      get(
        child(
          ref(this.database),
          `basic-info/${email.replace(/[.$#[\]/]/g, '_')}/lastViewedProduct`
        )
      )
    ).pipe(
      map((snapshot: DataSnapshot) => {
        let productName = '';
        if (snapshot.exists()) {
          productName = snapshot.val().product as string;
        }
        return productName;
      })
    );
  }

  getAllFavoritesProducts(email: string): Observable<IProduct[]> {
    return from(
      get(
        child(
          ref(this.database),
          `basic-info/${email.replace(/[.$#[\]/]/g, '_')}/favorites/`
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
          `basic-info/${email.replace(
            /[.$#[\]/]/g,
            '_'
          )}/favorites/${recordName}`
        ),
        product
      )
    );
  }

  searchFavoriteProduct(email: string, id: string) {
    const favoriteProductQuery = query(
      ref(
        this.database,
        `basic-info/${email.replace(/[.$#[\]/]/g, '_')}/favorites/${id}`
      )
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
  }

  deleteFavoriteProduct(email: string, favoriteId: string): Observable<void> {
    return from(
      remove(
        ref(
          this.database,
          `basic-info/${email.replace(
            /[.$#[\]/]/g,
            '_'
          )}/favorites/${favoriteId}`
        )
      )
    );
  }
}
