// angular stuff
import { createReducer, on } from '@ngrx/store';

// interfaces
import { ICategory } from '@models/category.model';

// created ngrx stuff
import * as CategoryActions from './category.actions';

export interface CategoryState {
  categories: ICategory[];
  errorMessage: string | null;
}

export const initialCategoryState: CategoryState = {
  categories: [],
  errorMessage: null,
};

export const categoryReducer = createReducer(
  initialCategoryState,
  on(CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    errorMessage: null,
  })),
  on(CategoryActions.loadCategoriesFailure, (state, { errorMessage }) => ({
    ...state,
    categories: [],
    errorMessage,
  })),
  on(CategoryActions.loadCategoryByIdSuccess, (state, { category }) => ({
    ...state,
    categories: [category],
    errorMessage: null,
  })),
  on(CategoryActions.loadCategoryByIdFailure, (state, { errorMessage }) => ({
    ...state,
    categories: [],
    errorMessage,
  }))
);
