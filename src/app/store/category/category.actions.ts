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
export const getCategoryById = createAction(
  '[Categories Component] GetCategoryById',
  props<{ categoryId: number }>()
);
export const getCategoryByIdSuccess = createAction(
  '[Categories Component] GetCategoryByIdSuccess',
  props<{ category: ICategory }>()
);
export const getCategoryByIdFailure = createAction(
  '[Categories Component] GetCategoryByIdFailure',
  props<{ errorMessage: string }>()
);
