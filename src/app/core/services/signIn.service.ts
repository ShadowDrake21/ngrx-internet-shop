// angular stuff
import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

// interfaces and types
import { IStoreUserCredential } from '../../shared/models/user.model';
import { AlertType } from '../../shared/models/alerts.model';

// created ngrx stuff
import { UserState } from '../../store/user/user.reducer';
import * as UserActions from '../../store/user/user.actions';

// utils
import { createAuthInLS } from '../utils/auth.utils';

@Injectable()
export class SignInService {
  signInForm!: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    rememberMe: FormControl<boolean | null>;
  }>;

  private store = inject(Store<UserState>);

  getSignInForm(): FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    rememberMe: FormControl<boolean | null>;
  }> {
    return (this.signInForm = new FormGroup({
      email: new FormControl('', [
        Validators.email,
        Validators.required,
        Validators.minLength(6),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),
      rememberMe: new FormControl(true),
    }));
  }

  setAlert(type: string, message: string, timeout: number): AlertType {
    return { type, msg: message, timeout };
  }

  signInManuallyDispatch() {
    this.store.dispatch(
      UserActions.signInManually({
        email: this.signInForm.value.email as string,
        password: this.signInForm.value.password as string,
      })
    );
  }

  signInManuallyFormReducedUserCredential(
    userCredential: IStoreUserCredential
  ) {
    const now = new Date();
    const updatedUserCredential = {
      ...userCredential,
      tokenResult: {
        ...userCredential.tokenResult,
        expirationTime: this.signInForm.value.rememberMe
          ? new Date(now.setMonth(now.getMonth() + 3)).toUTCString()
          : userCredential.tokenResult.expirationTime,
      },
    };
    createAuthInLS(updatedUserCredential);
  }

  signInWithFacebookDispatch() {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithFacebook());
  }

  signInWithTwitterDispatch() {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithTwitter());
  }

  signInWithGoogleDispatch() {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithGoogle());
  }
}
