// angular stuff
import { createReducer, on } from '@ngrx/store';

// interfaces
import { IUser, IUserBasic } from '../../shared/models/user.model';

// actions
import * as UserActions from './user.actions';

export interface UserState {
  basicInfo: IUserBasic | null;
  user: IUser | null;
  errorMessage: string | null;
}

export const initialUserState: UserState = {
  basicInfo: null,
  user: null,
  errorMessage: null,
};

export const userReducer = createReducer(
  initialUserState,
  on(
    UserActions.signInManuallySuccess,
    UserActions.browserReload,
    UserActions.signInWithFacebookSuccess,
    UserActions.signInWithTwitterSuccess,
    UserActions.signInWithGoogleSuccess,
    UserActions.getUserSuccess,
    UserActions.reauthenticateUserSuccess,

    (state, { userCredential, basicInfo }) => ({
      ...state,
      basicInfo: {
        displayName: basicInfo.displayName ?? state.basicInfo?.displayName,
        photoURL: basicInfo.photoURL ?? state.basicInfo?.photoURL,
        email: basicInfo.email ?? state.basicInfo?.email,
      },
      user: {
        userCredential,
        online: true,
      },
      errorMessage: null,
    })
  ),
  on(
    UserActions.signUpSuccess,

    (state, { userCredential, email }) => ({
      ...state,
      basicInfo: {
        displayName: state.basicInfo?.displayName!,
        photoURL: state.basicInfo?.photoURL!,
        email: email,
      },
      user: {
        userCredential,
        online: true,
      },
      errorMessage: null,
    })
  ),
  on(
    UserActions.updateDisplayName,

    (state, { displayName }) => ({
      ...state,
      basicInfo: {
        displayName,
        email: state.basicInfo?.email!,
        photoURL: state.basicInfo?.photoURL!,
      },
    })
  ),
  on(
    UserActions.updateProfileImage,

    (state, { imageURL }) => ({
      ...state,
      basicInfo: {
        displayName: state.basicInfo?.displayName!,
        email: state.basicInfo?.email!,
        photoURL: imageURL,
      },
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
    UserActions.updateDisplayNameFailure,
    UserActions.updateProfileImageFailure,
    (state, { errorMessage }) => ({
      ...state,
      basicInfo: null,
      user: {
        userCredential: null,
        online: false,
      },
      errorMessage,
    })
  ),
  on(UserActions.signInWithSocialsWrongProvider, (state, { basicInfo }) => ({
    ...state,
    basicInfo,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  })),

  // on(UserActions.updateDisplayName,)

  on(UserActions.signOutSuccess, UserActions.clearUserState, (state) => ({
    ...state,
    basicInfo: null,
    user: {
      userCredential: null,
      online: false,
    },
    errorMessage: null,
  }))
);
