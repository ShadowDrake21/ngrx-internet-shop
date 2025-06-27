// angular stuff
import { inject, Injectable } from '@angular/core';
import {
  child,
  Database,
  DataSnapshot,
  get,
  ref,
  remove,
} from '@angular/fire/database';
import { query, set } from 'firebase/database';
import { from, map, Observable, of } from 'rxjs';

// interfaces
import { ICard } from '@models/card.model';
import { IProduct } from '@models/product.model';
import { IShipping } from '@models/purchase.model';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly database = inject(Database);

  setDeliveryRecord(
    shipping: IShipping,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return this.setData(
      `customers/${customerId}/deliveryRecords/${recordName}`,
      shipping
    );
  }

  getAllDeliveryRecords(customerId: string): Observable<IShipping[]> {
    return this.getListData<IShipping>(
      `customers/${customerId}/deliveryRecords`
    );
  }

  deleteDeliveryRecord(customerId: string, recordId: string): Observable<void> {
    return this.deleteData(
      `customers/${customerId}/deliveryRecords/${recordId}`
    );
  }

  setCard(
    card: ICard,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return this.setData(`customers/${customerId}/cards/${recordName}`, card);
  }

  getAllCards(customerId: string): Observable<ICard[]> {
    return this.getListData<ICard>(`customers/${customerId}/cards/`);
  }

  deleteCard(customerId: string, cardId: string): Observable<void> {
    return this.deleteData(`customers/${customerId}/cards/${cardId}`);
  }

  setLastViewedProduct(email: string, productName: string) {
    return this.setData(this.getUserPath(email, 'lastViewedProduct'), {
      product: productName,
    });
  }

  getLastViewedProduct(email: string): Observable<string> {
    if (!email) return of('');

    return this.getData<{ product: string }>(
      this.getUserPath(email, 'lastViewedProduct')
    ).pipe(map((data) => data?.product || ''));
  }

  getAllFavoritesProducts(email: string): Observable<IProduct[]> {
    return this.getListData<IProduct>(this.getUserPath(email, 'favorites'));
  }

  setFavoriteProduct(
    product: IProduct,
    email: string,
    recordName: string
  ): Observable<void> {
    return this.setData(
      `
    ${this.getUserPath(email, 'favorites')}/${recordName}`,
      product
    );
  }

  searchFavoriteProduct(email: string, id: string) {
    return this.getData<IProduct>(this.getUserPath(email, `favorites/${id}`));
  }

  deleteFavoriteProduct(email: string, favoriteId: string): Observable<void> {
    return this.deleteData(this.getUserPath(email, `favorites/${favoriteId}`));
  }

  // ---------- Helpers -------------
  private setData<T>(path: string, data: T): Observable<void> {
    return from(set(ref(this.database, path), data));
  }

  private getData<T>(path: string): Observable<T | null> {
    return from(get(child(ref(this.database), path))).pipe(
      map((snapshot: DataSnapshot) =>
        snapshot.exists() ? (snapshot.val() as T) : null
      )
    );
  }

  private deleteData(path: string): Observable<void> {
    return from(remove(ref(this.database, path)));
  }

  private getListData<T>(path: string): Observable<T[]> {
    return this.getData<Record<string, T>>(path).pipe(
      map((data) => (data ? Object.values(data) : []))
    );
  }

  private getUserPath(email: string, ...segments: string[]): string {
    const sanitizedEmail = email.replace(/[.$#[\]/]/g, '_');
    return `basic-info/${sanitizedEmail}/${segments.join('/')}`;
  }
}
