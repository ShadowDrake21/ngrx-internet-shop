import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { IProduct } from '../../shared/models/product.model';
import { BASE_URL_API } from '../constants/api.constant';
import { ICategory } from '../../shared/models/category.model';
import { TFilterCategory } from '../../pages/products/components/filter-sidebar/content/filter-categories.content';
import { IFilterFormObj } from '../../shared/models/forms.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getAllProducts(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/products`)
      .pipe(map(this.mapQuantity));
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
      .pipe(map(this.mapQuantity));
  }

  getProductsByTitle(title: string): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(`${BASE_URL_API}/products/`, {
        params: new HttpParams().set('title', title),
      })
      .pipe(map(this.mapQuantity));
  }

  getSingleProductById(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${BASE_URL_API}/products/${id}`);
  }

  getCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${BASE_URL_API}/categories`);
  }

  private mapQuantity(products: IProduct[]): IProduct[] {
    return products.map((product) => ({ ...product, quantity: 1 }));
  }
}
