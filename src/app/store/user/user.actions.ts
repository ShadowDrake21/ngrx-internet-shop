import { createAction, props } from '@ngrx/store';
import { IStoreUserCredential } from '../../shared/models/user.model';

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

export const signOut = createAction('[User Component] SignOut');
export const signOutSuccess = createAction('[User Component] SignOutSuccess');

export const browserReload = createAction(
  '[User Component] BrowserReload',
  props<{ userCredential: IStoreUserCredential }>()
);
export const clearUserState = createAction('[User Component] ClearUserState');
