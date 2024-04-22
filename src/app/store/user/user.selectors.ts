import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUserCredential = createSelector(
  selectUserState,
  (state: UserState) => state.userCredential
);

export const selectUserOnline = createSelector(
  selectUserState,
  (state: UserState) => state.online
);

export const selectErrorMessage = createSelector(
  selectUserState,
  (state: UserState) => state.errorMessage
);
