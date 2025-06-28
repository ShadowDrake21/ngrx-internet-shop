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
import { catchError, from, map, Observable, of, tap, throwError } from 'rxjs';

// interfaces
import { ICard } from '@models/card.model';
import { IProduct } from '@models/product.model';
import { IShipping } from '@models/purchase.model';
import { environment } from 'environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private readonly database = inject(Database);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.firebaseConfig.databaseURL;

  setDeliveryRecord(
    shipping: IShipping,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return this.setData(
      this.buildPath(['customers', customerId, 'deliveryRecords', recordName]),
      shipping
    );
  }

  getAllDeliveryRecords(customerId: string): Observable<IShipping[]> {
    return this.getListData<IShipping>(
      this.buildPath(['customers', customerId, 'deliveryRecords'])
    );
  }

  deleteDeliveryRecord(customerId: string, recordId: string): Observable<void> {
    return this.deleteData(
      this.buildPath(['customers', customerId, 'deliveryRecords', recordId])
    );
  }

  setCard(
    card: ICard,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return this.setData(
      this.buildPath(['customers', customerId, 'cards', recordName]),
      card
    );
  }

  getAllCards(customerId: string): Observable<ICard[]> {
    return this.getListData<ICard>(
      this.buildPath(['customers', customerId, 'cards'])
    );
  }

  deleteCard(customerId: string, cardId: string): Observable<void> {
    return this.deleteData(
      this.buildPath(['customers', customerId, 'cards', cardId])
    );
  }

  setLastViewedProduct(email: string, productName: string) {
    return this.setData(this.buildUserPath(email, 'lastViewedProduct'), {
      product: productName,
    });
  }

  getLastViewedProduct(email: string): Observable<string> {
    if (!email) return of('');

    return this.getData<{ product: string }>(
      this.buildUserPath(email, 'lastViewedProduct')
    ).pipe(map((data) => data?.product || ''));
  }

  getAllFavoritesProducts(email: string): Observable<IProduct[]> {
    return this.getListData<IProduct>(this.buildUserPath(email, 'favorites'));
  }

  setFavoriteProduct(
    product: IProduct,
    email: string,
    recordName: string
  ): Observable<void> {
    const path = this.buildUserPath(email, 'favorites', recordName);

    if (!path) {
      return throwError(() => new Error('Invalid path generated'));
    }

    return this.setData(path, product);
  }

  searchFavoriteProduct(email: string, id: string) {
    return this.getData<IProduct>(this.buildUserPath(email, 'favorites', id));
  }

  deleteFavoriteProduct(email: string, favoriteId: string): Observable<void> {
    return this.deleteData(this.buildUserPath(email, 'favorites', favoriteId));
  }

  // ---------- Helpers -------------
  private setData<T>(path: string, data: T): Observable<void> {
    if (!path || typeof path !== 'string') {
      return throwError(() => new Error('Invalid database path'));
    }

    const cleanData = JSON.parse(JSON.stringify(data));
    const url = `${this.baseUrl}/${path}.json`;

    return this.http.put<void>(url, cleanData).pipe(
      catchError((error) => {
        console.error('Firebase write failed:', error);
        return throwError(() => error);
      })
    );
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

  // ---------- Path Builders -------------

  private buildPath(segments: string[]): string {
    try {
      if (!segments || !Array.isArray(segments)) {
        throw new Error('Invalid segments array');
      }

      const validSegments = segments.filter(
        (segment) =>
          segment !== undefined &&
          segment !== null &&
          segment !== '' &&
          typeof segment === 'string'
      );

      if (validSegments.length === 0) {
        throw new Error('No valid segments provided');
      }

      const path = validSegments.join('/');

      return path;
    } catch (error) {
      console.error('Path building failed:', error, 'with segments:', segments);
      return '';
    }
  }

  private buildUserPath(email: string, ...segments: string[]): string {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email provided');
      }

      const sanitizedEmail = this.sanitizeEmail(email);
      if (!sanitizedEmail) {
        throw new Error('Email sanitization failed');
      }

      const allSegments = ['basic-info', sanitizedEmail, ...segments];
      const path = this.buildPath(allSegments);

      if (!path) {
        throw new Error('Path construction failed');
      }

      return path;
    } catch (error) {
      console.error(
        'User path building failed:',
        error,
        'with email:',
        email,
        'segments:',
        segments
      );
      return '';
    }
  }

  private sanitizeEmail(email: string): string {
    try {
      if (!email || typeof email !== 'string') {
        return '';
      }
      return email.replace(/[.$#[\]/]/g, '_');
    } catch (error) {
      console.error('Email sanitization failed:', error);
      return '';
    }
  }
}
