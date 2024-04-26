import { UserCredential } from 'firebase/auth';
import * as UserActions from './user.actions';
import { createReducer, on } from '@ngrx/store';
import { IStoreUserCredential, IUser } from '../../shared/models/user.model';

export interface UserState {
  email: string | null;
  user: IUser | null;
  errorMessage: string | null;
}

export const initialUserState: UserState = {
  email: null,
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
  on(
    UserActions.signInWithFacebookSuccess,
    (state, { userCredential, email }) => ({
      ...state,
      email,
      user: {
        userCredential,
        online: true,
      },
      errorMessage: null,
    })
  ),
  on(UserActions.signInWithFacebookFailure, (state, { errorMessage }) => ({
    ...state,
    email: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(
    UserActions.signInWithTwitterSuccess,
    (state, { userCredential, email }) => ({
      ...state,
      email,
      user: {
        userCredential,
        online: true,
      },
      errorMessage: null,
    })
  ),
  on(UserActions.signInWithTwitterFailure, (state, { errorMessage }) => ({
    ...state,
    email: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(
    UserActions.signInWithGoogleSuccess,
    (state, { userCredential, email }) => ({
      ...state,
      email,
      user: {
        userCredential,
        online: true,
      },
      errorMessage: null,
    })
  ),
  on(UserActions.signInWithGoogleFailure, (state, { errorMessage }) => ({
    ...state,
    email: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage,
  })),
  on(UserActions.signInWithSocialsWrongProvider, (state, { email }) => ({
    ...state,
    email,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  })),
  on(UserActions.signOutSuccess, (state) => ({
    ...state,
    email: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  })),
  on(UserActions.clearUserState, (state) => ({
    ...state,
    email: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  }))
);
