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
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${BASE_URL_API}/categories`;

  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(this.baseUrl);
  }

  getCategoryById(categoryId: number): Observable<ICategory> {
    return this.http.get<ICategory>(`${this.baseUrl}/${categoryId}`);
  }

  getCategoryByName(categoryName: string): Observable<ICategory | null> {
    return this.getAllCategories().pipe(
      map(
        (categories) =>
          categories.find(
            (category) =>
              category.name.toLowerCase().trim() ===
              categoryName.toLowerCase().trim()
          ) || null
      )
    );
  }
}
