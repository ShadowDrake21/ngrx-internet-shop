// angular stuff
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// interfaces
import { IProduct } from '@models/product.model';
import { IFilterFormObj } from '@models/forms.model';

// constants
import { BASE_URL_API } from '../constants/api.constants';

// utils
import { mapQuantity } from '../utils/services.utils';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL_API}/products`;

  getAllProducts(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.baseUrl).pipe(map(mapQuantity));
  }

  getFilteredProducts(filteredData: IFilterFormObj): Observable<IProduct[]> {
    const params = this.buildFilterParams(filteredData);

    return this.http
      .get<IProduct[]>(this.baseUrl, {
        params,
      })
      .pipe(map(mapQuantity));
  }

  getProductsByTitle(title: string): Observable<IProduct[]> {
    const params = new HttpParams().set('title', title);
    return this.http
      .get<IProduct[]>(this.baseUrl, {
        params,
      })
      .pipe(map(mapQuantity));
  }

  getSingleProductById(id: number): Observable<IProduct> {
    return this.http
      .get<IProduct>(`${this.baseUrl}/${id}`)
      .pipe(map((product) => ({ ...product, quantity: 1 })));
  }

  getProductsByCategory(
    categoryId: number,
    pagination?: { offset: number; limit: number }
  ): Observable<IProduct[]> {
    let params = new HttpParams();
    if (pagination) {
      params = params
        .set('offset', pagination.offset.toString())
        .set('limit', pagination.limit.toString());
    }

    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/categories/${categoryId}/products`, {
        params,
      })
      .pipe(map(mapQuantity));
  }

  // ----------- Helpers ------------
  private buildFilterParams(filteredData: IFilterFormObj): HttpParams {
    let params = new HttpParams();

    if (filteredData.categoryId) {
      params = params.set('categoryId', filteredData.categoryId);
    }

    if (filteredData.maxPriceLimit) {
      params = params
        .set('price_min', '1')
        .set('price_max', filteredData.maxPriceLimit.toString());
    }

    return params;
  }
}
