import { UserCredential } from 'firebase/auth';
import * as UserActions from './user.actions';
import { createReducer, on } from '@ngrx/store';
import { IStoreUserCredential, IUser } from '../../shared/models/user.model';

export interface UserState {
  user: IUser | null;
  errorMessage: string | null;
}

export const initialUserState: UserState = {
  user: null,
  errorMessage: null,
};

export const userReducer = createReducer(
  initialUserState,
  on(
    UserActions.signInManuallySuccess,
    UserActions.browserReload,
    (state, { userCredential }) => ({
      ...state,
      user: {
        userCredential,
        online: true,
      },

      errorMessage: null,
    })
  ),
  on(UserActions.signInManuallyFailure, (state, { errorMessage }) => ({
    ...state,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(UserActions.signInViaFacebookSuccess, (state, { userCredential }) => ({
    ...state,
    user: {
      userCredential,
      online: true,
    },
    errorMessage: null,
  })),
  on(UserActions.signInViaFacebookFailure, (state, { errorMessage }) => ({
    ...state,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(UserActions.signInViaTwitterSuccess, (state, { userCredential }) => ({
    ...state,
    user: {
      userCredential,
      online: true,
    },
    errorMessage: null,
  })),
  on(UserActions.signInViaTwitterFailure, (state, { errorMessage }) => ({
    ...state,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(UserActions.signInViaGoogleSuccess, (state, { userCredential }) => ({
    ...state,
    user: {
      userCredential,
      online: true,
    },
    errorMessage: null,
  })),
  on(UserActions.signInViaGoogleFailure, (state, { errorMessage }) => ({
    ...state,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(UserActions.signOutSuccess, (state) => ({
    ...state,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  })),
  on(UserActions.clearUserState, (state) => ({
    ...state,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  }))
);
