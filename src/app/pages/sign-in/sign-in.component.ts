// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import { debounceTime, Subscription, take } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router, RouterLink } from '@angular/router';

// services
import { SignInService } from '@core/services/signIn.service';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';

// interfaces and types
import { AlertType } from '@models/alerts.model';
import { IStoreUserCredential, IUser } from '@models/user.model';

// components
import { AlertComponent } from '@shared/components/alert/alert.component';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ResetPasswordModalComponent } from './components/reset-password-modal/reset-password-modal.component';

// utils
import { signInModalIcons } from '@shared/utils/icons.utils';
import { ISignInForm } from '@app/shared/models/auth.model';
import { testSignIn } from './content/test-data.content';
import { FormErrorMessagesComponent } from './components/form-error-messages/form-error-messages.component';
import { SocialLoginComponent } from './components/social-login/social-login.component';
import { SignInUtilsService } from './services/signInUtils.service';

@Component({
  selector: 'app-sign-in',
  imports: [
    FontAwesomeModule,
    ReactiveFormsModule,
    AlertComponent,
    LoaderComponent,
    RouterLink,
    FormErrorMessagesComponent,
    SocialLoginComponent,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  providers: [BsModalService, SignInService, SignInUtilsService],
})
export class SignInComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store<UserState>);
  private readonly utilsService = inject(SignInUtilsService);
  private readonly signInService = inject(SignInService);
  private readonly router = inject(Router);

  readonly icons = signInModalIcons;
  alerts: AlertType[] = [];
  isLogging: boolean = false;
  signInForm!: ISignInForm;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signInForm = this.signInService.getSignInForm();
  }

  onFormSubmit() {
    if (this.signInForm.invalid) return;

    this.setLoadingState();
    this.signInService.signInManuallyDispatch();
    this.subscriptions.add(this.handleSignInResponse());
  }

  private setLoadingState(): void {
    this.isLogging = true;
    this.alerts = [];
  }

  setTestProfile() {
    this.signInForm.setValue(testSignIn);
  }

  private handleSignInResponse(): Subscription {
    return this.store
      .select(UserSelectors.selectUser)
      .pipe(debounceTime(5000), take(1))
      .subscribe({
        next: (user) => this.processSignInResponse(user),
        error: () => this.handleSignInError(),
      });
  }

  private processSignInResponse(user: IUser | null): void {
    this.isLogging = false;

    if (user?.userCredential) {
      this.handleSuccessfulSignIn(user.userCredential);
    } else {
      this.handleSignInError();
    }
  }

  private handleSuccessfulSignIn(credential: IStoreUserCredential): void {
    this.signInService.signInManuallyFormReducedUserCredential(
      credential,
      this.signInForm.value.rememberMe!
    );

    this.router.navigate(['/']);
  }

  private handleSignInError(): void {
    this.subscriptions.add(
      this.store
        .select(UserSelectors.selectErrorMessage)
        .subscribe((errorMessage) => {
          if (errorMessage) {
            this.alerts.push(this.utilsService.showErrorAlert(errorMessage));
            this.resetForm();
          }
        })
    );
  }

  private resetForm(): void {
    this.signInForm.reset({ rememberMe: false });
  }

  openResetPasswordModal() {
    this.utilsService.showModal(ResetPasswordModalComponent);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
