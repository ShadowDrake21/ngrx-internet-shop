// angular stuff
import { createFeatureSelector, createSelector } from '@ngrx/store';

// created ngrx stuff
import { CategoryState } from './category.reducer';

export const selectCategoryState =
  createFeatureSelector<CategoryState>('category');

export const selectCategories = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.categories
);
export const selectErrorMessage = createSelector(
  selectCategoryState,
  (state: CategoryState) => state.errorMessage
);
