import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { IProduct } from '../../shared/models/product.model';
import { BASE_URL_API } from '../constants/api.constant';
import { ICategory } from '../../shared/models/category.model';
import { IFilterFormObj } from '../../shared/models/forms.model';
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

  getAllProductsByCategory(categoryId: number): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/categories/${categoryId}/products`)
      .pipe(map(mapQuantity));
  }
}
