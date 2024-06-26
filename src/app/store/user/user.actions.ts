// angular stuff
import { createAction, props } from '@ngrx/store';

// interfaces
import { IStoreUserCredential, IUserSignUpData } from '@models/user.model';

export const signUp = createAction(
  '[User Component] SignUp',
  props<{ data: IUserSignUpData }>()
);
export const signUpSuccess = createAction(
  '[User Component] SignUpSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const signUpFailure = createAction(
  '[User Component] SignUpFailure',
  props<{ errorMessage: string }>()
);

export const signInManually = createAction(
  '[User Component] SignInManually',
  props<{ email: string; password: string }>()
);
export const signInManuallySuccess = createAction(
  '[User Component] SignInManuallySuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const signInManuallyFailure = createAction(
  '[User Component] SignInManuallyFailure',
  props<{ errorMessage: string }>()
);

export const signInWithFacebook = createAction(
  '[User Component] SignInWithFacebook'
);
export const signInWithFacebookSuccess = createAction(
  '[User Component] SignInWithFacebookSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const signInWithFacebookFailure = createAction(
  '[User Component] SignInWithFacebookFailure',
  props<{
    errorMessage: string;
  }>()
);

export const signInWithTwitter = createAction(
  '[User Component] SignInWithTwitter'
);
export const signInWithTwitterSuccess = createAction(
  '[User Component] SignInWithTwitterSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const signInWithTwitterFailure = createAction(
  '[User Component] SignInWithTwitterFailure',
  props<{
    errorMessage: string;
  }>()
);

export const signInWithGoogle = createAction(
  '[User Component] SignInWithGoogle'
);
export const signInWithGoogleSuccess = createAction(
  '[User Component] SignInWithGoogleSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const signInWithGoogleFailure = createAction(
  '[User Component] SignInWithGoogleFailure',
  props<{
    errorMessage: string;
  }>()
);

export const signInWithSocialsWrongProvider = createAction(
  '[User Component] SignInWithSocialsWrongProvider',
  props<{ email: string }>()
);

export const sendPasswordReset = createAction(
  '[User Component] SendPasswordReset',
  props<{ email: string }>()
);

export const sendEmailVerification = createAction(
  '[User Component] SendEmailVerification'
);

export const getUser = createAction('[User Component] GetUser');
export const getUserSuccess = createAction(
  '[User Component] GetUserSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const getUserFailure = createAction(
  '[User Component] GetUserFailure',
  props<{ errorMessage: string }>()
);

export const reauthenticateUser = createAction(
  '[User Component] ReauthenticateUser',
  props<{ email: string; password: string }>()
);
export const reauthenticateUserSuccess = createAction(
  '[User Component] ReauthenticateUserSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const reauthenticateUserFailure = createAction(
  '[User Component] ReauthenticateUserFailure',
  props<{ errorMessage: string }>()
);

export const updateProfileImage = createAction(
  '[User Component] UpdateProfileImage',
  props<{ imageURL: string }>()
);
export const updateProfileImageSuccess = createAction(
  '[User Component] UpdateProfileImageSuccess',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const updateProfileImageFailure = createAction(
  '[User Component] UpdateProfileImageFailure',
  props<{ errorMessage: string }>()
);

export const signOut = createAction('[User Component] SignOut');
export const signOutSuccess = createAction('[User Component] SignOutSuccess');

export const browserReload = createAction(
  '[User Component] BrowserReload',
  props<{ email: string; userCredential: IStoreUserCredential }>()
);
export const clearUserState = createAction('[User Component] ClearUserState');
