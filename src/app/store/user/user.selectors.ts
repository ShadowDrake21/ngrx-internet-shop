import { createFeatureSelector, createSelector } from '@ngrx/store';

// state
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectBasicInfo = createSelector(
  selectUserState,
  (state: UserState) => state.basicInfo
);

export const selectUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);

export const selectErrorMessage = createSelector(
  selectUserState,
  (state: UserState) => state.errorMessage
);
