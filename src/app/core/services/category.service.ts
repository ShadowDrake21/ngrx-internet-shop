// angular stuff
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// interfaces
import { ICategory } from '@models/category.model';

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

  getCategoryByName(categoryName: string): Observable<ICategory | null> {
    const allCategories$ = this.getAllCategories();
    return allCategories$.pipe(
      map(
        (categories) =>
          categories.find(
            (category) =>
              category.name.toLowerCase() === categoryName.toLowerCase()
          ) as ICategory | null
      )
    );
  }
}
