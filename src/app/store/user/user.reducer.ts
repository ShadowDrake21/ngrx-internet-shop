import { UserCredential } from 'firebase/auth';
import * as UserActions from './user.actions';
import { createReducer, on } from '@ngrx/store';
import { IStoreUserCredential } from '../../shared/models/user.model';

export interface UserState {
  userCredential: IStoreUserCredential | null;
  online: boolean;
  errorMessage: string | null;
}

export const initialUserState: UserState = {
  userCredential: null,
  online: false,
  errorMessage: null,
};

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.signInManuallySuccess, (state, { userCredential }) => ({
    ...state,
    userCredential,
    online: true,
    errorMessage: null,
  })),
  on(UserActions.signInManuallyFailure, (state, { errorMessage }) => ({
    ...state,
    userCredential: null,
    online: false,
    errorMessage,
  })),
  on(UserActions.signOutSuccess, (state) => ({
    ...state,
    userCredential: null,
    online: false,
    errorMessage: null,
  }))
);