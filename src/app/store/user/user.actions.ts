import { createAction, props } from '@ngrx/store';
import { UserCredential } from '@angular/fire/auth';

export const signInManually = createAction(
  '[User Component] SignInManually',
  props<{ email: string; password: string }>()
);

export const signInManuallySuccess = createAction(
  '[User Component] SignInManuallySuccess',
  props<{ userCredential: UserCredential }>()
);

export const signInManuallyFailure = createAction(
  '[User Component] SignInManuallyFailure',
  props<{ errorMessage: string }>()
);
