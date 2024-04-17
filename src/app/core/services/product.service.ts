import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { IProduct } from '../../shared/models/product.model';
import { BASE_URL_API } from '../constants/api.constant';
import { ICategory } from '../../shared/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/products`)
      .pipe(
        map((products) =>
          products.map((product) => ({ ...product, quantity: 1 }))
        )
      );
  }

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${BASE_URL_API}/categories`);
  }
}
