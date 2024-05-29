// angular stuff
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';

// services
import { CategoryService } from '../../core/services/category.service';

// created ngrx stuff
import * as CategoryActions from './category.actions';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private categoryService = inject(CategoryService);

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.loadCategories),
      exhaustMap(() =>
        this.categoryService.getAllCategories().pipe(
          map((categories) =>
            CategoryActions.loadCategoriesSuccess({ categories })
          ),
          catchError((error) =>
            of(
              CategoryActions.loadCategoriesFailure({
                errorMessage: 'Error during the categories loading!',
              })
            )
          )
        )
      )
    )
  );

  getCategoryById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoryActions.loadCategoryById),
      exhaustMap(({ categoryId }) =>
        this.categoryService.getCategoryById(categoryId).pipe(
          map((category) =>
            CategoryActions.loadCategoryByIdSuccess({ category })
          ),
          catchError((error) =>
            of(
              CategoryActions.loadCategoryByIdFailure({
                errorMessage: 'Error during the category fetching!',
              })
            )
          )
        )
      )
    )
  );
}
