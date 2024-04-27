// angular stuff
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// interfaces
import { ICategory } from '../../shared/models/category.model';

// constants
import { BASE_URL_API } from '../constants/api.constants';

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
