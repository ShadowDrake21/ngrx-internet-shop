// angular stuff
import { createReducer, on } from '@ngrx/store';

// interfaces
import { IUser } from '../../shared/models/user.model';

// actions
import * as UserActions from './user.actions';

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
    UserActions.signUpSuccess,
    UserActions.signInManuallySuccess,
    UserActions.browserReload,
    UserActions.signInWithFacebookSuccess,
    UserActions.signInWithTwitterSuccess,
    UserActions.signInWithGoogleSuccess,
    UserActions.getUserSuccess,
    UserActions.reauthenticateUserSuccess,
    UserActions.updateProfileImageSuccess,
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
  on(
    UserActions.signUpFailure,
    UserActions.signInManuallyFailure,
    UserActions.signInWithFacebookFailure,
    UserActions.signInWithTwitterFailure,
    UserActions.signInWithGoogleFailure,
    UserActions.getUserFailure,
    UserActions.reauthenticateUserFailure,
    UserActions.updateProfileImageFailure,
    (state, { errorMessage }) => ({
      ...state,
      user: {
        userCredential: null,
        online: false,
      },
      errorMessage,
    })
  ),
  on(UserActions.signInWithSocialsWrongProvider, (state, { email }) => ({
    ...state,
    email,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  })),
  on(UserActions.signOutSuccess, UserActions.clearUserState, (state) => ({
    ...state,
    email: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  }))
);
