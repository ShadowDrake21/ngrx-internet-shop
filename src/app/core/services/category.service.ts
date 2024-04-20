import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ICategory } from '../../shared/models/category.model';
import { map, Observable } from 'rxjs';
import { BASE_URL_API } from '../constants/api.constant';
import { IProduct } from '../../shared/models/product.model';
import { mapQuantity } from '../utils/services.utils';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(`${BASE_URL_API}/categories`);
  }

  getCategoryById(categoryId: number): Observable<ICategory> {
    return this.http.get<ICategory>(`${BASE_URL_API}/categories/${categoryId}`);
  }
}
