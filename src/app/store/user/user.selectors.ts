import { createFeatureSelector, createSelector } from '@ngrx/store';

// state
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectEmail = createSelector(
  selectUserState,
  (state: UserState) => state.email
);

export const selectUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);

export const selectChanged = createSelector(
  selectUserState,
  (state: UserState) => state.changed
);

export const selectErrorMessage = createSelector(
  selectUserState,
  (state: UserState) => state.errorMessage
);
