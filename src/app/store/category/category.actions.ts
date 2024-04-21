import { createAction, props } from '@ngrx/store';
import { ICategory } from '../../shared/models/category.model';

export const loadCategories = createAction(
  '[Categories Component] LoadCategories'
);
export const loadCategoriesSuccess = createAction(
  '[Categories Component] LoadCategoriesSuccess',
  props<{ categories: ICategory[] }>()
);
export const loadCategoriesFailure = createAction(
  '[Categories Component] LoadCategoriesFailure',
  props<{ errorMessage: string }>()
);
export const loadCategoryById = createAction(
  '[Categories Component] LoadCategoryById',
  props<{ categoryId: number }>()
);
export const loadCategoryByIdSuccess = createAction(
  '[Categories Component] LoadCategoryByIdSuccess',
  props<{ category: ICategory }>()
);
export const loadCategoryByIdFailure = createAction(
  '[Categories Component] LoadCategoryByIdFailure',
  props<{ errorMessage: string }>()
);
