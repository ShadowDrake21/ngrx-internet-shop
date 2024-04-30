// angular stuff
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// interfaces
import { IProduct } from '../../shared/models/product.model';
import { IFilterFormObj } from '../../shared/models/forms.model';

// constants
import { BASE_URL_API } from '../constants/api.constants';

// utils
import { mapQuantity } from '../utils/services.utils';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getAllProducts(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/products`)
      .pipe(map(mapQuantity));
  }

  getFilteredProducts(filteredData: IFilterFormObj): Observable<IProduct[]> {
    let requestParams = new HttpParams();

    if (filteredData.categoryId && filteredData.maxPriceLimit) {
      console.log('filteredData.categoryId && filteredData.maxPriceLimit');
      requestParams = requestParams
        .append('price_min', 1)
        .append('price_max', filteredData.maxPriceLimit)
        .append('categoryId', filteredData.categoryId);
    }
    if (filteredData.categoryId && !filteredData.maxPriceLimit) {
      console.log('filteredData.categoryId && !filteredData.maxPriceLimit');
      requestParams = requestParams.append(
        'categoryId',
        filteredData.categoryId
      );
    }
    if (!filteredData.categoryId && filteredData.maxPriceLimit) {
      console.log('!filteredData.categoryId && filteredData.maxPriceLimit');
      requestParams = requestParams
        .append('price_min', 1)
        .append('price_max', filteredData.maxPriceLimit as number);
    }
    console.log(requestParams);
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/products/`, {
        params: requestParams,
      })
      .pipe(map(mapQuantity));
  }

  getProductsByTitle(title: string): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/products/`, {
        params: new HttpParams().set('title', title),
      })
      .pipe(map(mapQuantity));
  }

  getSingleProductById(id: number): Observable<IProduct> {
    return this.http
      .get<IProduct>(`${BASE_URL_API}/products/${id}`)
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
}
