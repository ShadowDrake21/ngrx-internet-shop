import { createAction, props } from '@ngrx/store';
import { UserCredential } from '@angular/fire/auth';
import { IStoreUserCredential, IUser } from '../../shared/models/user.model';
import { Observable } from 'rxjs';

export const signInManually = createAction(
  '[User Component] SignInManually',
  props<{ email: string; password: string }>()
);
export const signInManuallySuccess = createAction(
  '[User Component] SignInManuallySuccess',
  props<{ userCredential: IStoreUserCredential }>()
);
export const signInManuallyFailure = createAction(
  '[User Component] SignInManuallyFailure',
  props<{ errorMessage: string }>()
);
export const signInViaFacebook = createAction(
  '[User Component] SignInViaFacebook'
);
export const signInViaFacebookSuccess = createAction(
  '[User Component] SignInViaFacebookSuccess',
  props<{ userCredential: IStoreUserCredential }>()
);
export const signInViaFacebookFailure = createAction(
  '[User Component] SignInViaFacebookFailure',
  props<{
    errorMessage: string;
  }>()
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
