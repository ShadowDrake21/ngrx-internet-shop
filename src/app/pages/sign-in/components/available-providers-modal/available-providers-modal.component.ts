// angular stuff
import { Component, inject, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { debounceTime, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

// interfaces
import { IUser } from '@models/user.model';

// services
import { SignInService } from '@core/services/signIn.service';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';

// components
import { LoaderComponent } from '@shared/components/loader/loader.component';

// utils
import { createAuthInLS } from '@core/utils/auth.utils';
import { signInModalIcons } from '@shared/utils/icons.utils';
import { SocialProvider } from '@app/shared/models/auth.model';
import { FormErrorMessagesComponent } from './components/form-error-messages/form-error-messages.component';

@Component({
  selector: 'app-available-providers-modal',
  imports: [
    FontAwesomeModule,
    ReactiveFormsModule,
    LoaderComponent,
    FormErrorMessagesComponent,
  ],
  templateUrl: './available-providers-modal.component.html',
  styleUrl: './available-providers-modal.component.scss',
  providers: [SignInService],
})
export class AvailableProvidersModalComponent implements OnDestroy {
  readonly icons = signInModalIcons;

  private readonly store = inject(Store<UserState>);
  private readonly signInService = inject(SignInService);
  private readonly router = inject(Router);
  private readonly _bsModalRef = inject(BsModalRef);

  get bsModalRef(): BsModalRef {
    return this._bsModalRef;
  }

  availableProviders: string[] = [];
  closeBtnName?: string;
  errorMessage = '';
  isLogging: boolean = false;

  signInForm = this.signInService.getSignInForm();

  private subscriptions: Subscription[] = [];

  onFormSubmit() {
    this.isLogging = true;
    this.signInService.signInManuallyDispatch();

    const sub = this.store
      .select(UserSelectors.selectUser)
      .pipe(debounceTime(5000), take(1))
      .subscribe((user) => this.handleManualSignInResponse(user));

    this.subscriptions.push(sub);
  }

  private handleManualSignInResponse(user: IUser | null): void {
    if (user?.userCredential && this.isLogging) {
      this.signInService.signInManuallyFormReducedUserCredential(
        user.userCredential,
        this.signInForm.value.rememberMe!
      );
      this.navigateAndClose();
    } else {
      this.showError('Incorrect user credential!');
    }
    this.isLogging = false;
  }

  private navigateAndClose(): void {
    this.router.navigate(['/']);
    this._bsModalRef.hide();
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
    this.resetForm();
  }

  private resetForm() {
    this.signInForm.reset();
    this.signInForm.controls.rememberMe.setValue(true);
  }

  signInWith(provider: SocialProvider): void {
    this.isLogging = true;

    switch (provider) {
      case 'facebook':
        this.signInService.signInWithTwitterDispatch();
        break;
      case 'twitter':
        this.signInService.signInWithTwitterDispatch();
        break;
      case 'google':
        this.signInService.signInWithGoogleDispatch();
        break;
      default:
        this.showError('Unsupported provider');
    }

    const sub = this.handleSocialSignIn();
    this.subscriptions.push(sub);
  }

  private handleSocialSignIn(): Subscription {
    return this.store.select(UserSelectors.selectUser).subscribe((user) => {
      if (user?.userCredential) {
        createAuthInLS(user?.userCredential!);
        this.navigateAndClose();
        this.isLogging = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
