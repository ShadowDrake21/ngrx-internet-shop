import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@app/core/authentication/auth.service';
import { SignInService } from '@app/core/services/signIn.service';
import { minimalizeUserCredential } from '@app/shared/utils/store.utils';
import { UserState } from '@app/store/user/user.reducer';
import { Store } from '@ngrx/store';
import { FirebaseError } from 'firebase/app';
import { UserCredential } from 'firebase/auth';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-reauthenticate-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reauthenticate-modal.component.html',
  styleUrl: './reauthenticate-modal.component.scss',
  providers: [SignInService],
})
export class ReauthenticateModalComponent {
  private store = inject(Store<UserState>);
  private authService = inject(AuthService);
  public bsModalRef = inject(BsModalRef);
  private signInService = inject(SignInService);

  @Output() occuredError: EventEmitter<string> = new EventEmitter<string>();

  email?: string;
  closeBtnName?: string;
  isChangePassword?: boolean = true;
  error: string = '';

  isSuccessReauthentication: boolean | null = null;

  reauthenticationForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
    rememberMe: new FormControl(true),
  });

  onReauthenticationSubmit() {
    // this.store.dispatch(UserActions.reauthenticateUser({email: this.email!, password: this.reauthenticationForm.value.password!}))

    this.authService
      .reauthenticateUser(
        this.email!,
        this.reauthenticationForm.value.password!
      )
      .then(async (credential) => {
        console.log('Reauthentication success!', credential);
        this.signInService.signInManuallyFormReducedUserCredential(
          await minimalizeUserCredential(credential)
        );
        this.isSuccessReauthentication = true;
        this.bsModalRef.hide();
      })
      .catch((err: FirebaseError) => {
        console.log(err);
        this.error = err.message;
        this.isSuccessReauthentication = false;
        this.occuredError.emit(err.message);
      });

    //   TypeError: Cannot read properties of undefined (reading 'value')
    // at _SignInService.signInManuallyFormReducedUserCredential (signIn.service.ts:69:41)
    // at _ReauthenticateModalComponent.<anonymous> (reauthenticate-modal.component.ts:60:28)
    // at Generator.next (<anonymous>)
    // at fulfilled (chunk-4WXVOEFY.js:24:24)
    // at _ZoneDelegate.invoke (zone.js:368:26)
    // at Object.onInvoke (core.mjs:14882:33)
    // at _ZoneDelegate.invoke (zone.js:367:52)
    // at _Zone.run (zone.js:130:43)
    // at zone.js:1260:36
    // at _ZoneDelegate.invokeTask (zone.js:403:31)
  }
}
