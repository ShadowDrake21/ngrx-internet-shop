// angular stuff
import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

// interfaces and types
import { IStoreUserCredential } from '@models/user.model';
import { AlertType } from '@models/alerts.model';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserActions from '@store/user/user.actions';

// utils
import { createAuthInLS } from '../utils/auth.utils';
import { ISignInForm } from '@app/shared/models/auth.model';

@Injectable()
export class SignInService {
  private readonly store = inject(Store<UserState>);
  private signInForm!: ISignInForm;

  getSignInForm(): ISignInForm {
    if (!this.signInForm) {
      this.signInForm = new FormGroup({
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
      });
    }
    return this.signInForm;
  }

  setAlert(type: string, message: string, timeout: number): AlertType {
    return { type, msg: message, timeout };
  }

  signInManuallyDispatch() {
    const { email, password } = this.signInForm.value;
    if (email && password) {
      this.store.dispatch(
        UserActions.signInManually({
          email: email as string,
          password: password as string,
        })
      );
    }
  }

  signInManuallyFormReducedUserCredential(
    userCredential: IStoreUserCredential,
    isLongTerm: boolean
  ) {
    const expirationTime = isLongTerm
      ? this.getExtendedExpirationTime()
      : userCredential.tokenResult.expirationTime;

    const updatedUserCredential = {
      ...userCredential,
      tokenResult: {
        ...userCredential.tokenResult,
        expirationTime,
      },
    };

    createAuthInLS(updatedUserCredential);
  }

  signInWithFacebookDispatch() {
    this.clearStateAndDispatch(UserActions.signInWithFacebook());
  }

  signInWithTwitterDispatch() {
    this.clearStateAndDispatch(UserActions.signInWithTwitter());
  }

  signInWithGoogleDispatch() {
    this.clearStateAndDispatch(UserActions.signInWithGoogle());
  }

  // ------------- HELPER METHODS ------------- //
  private getExtendedExpirationTime(): string {
    const now = new Date();
    return new Date(now.setMonth(now.getMonth() + 3)).toUTCString();
  }

  private clearStateAndDispatch(action: any): void {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(action);
  }
}
