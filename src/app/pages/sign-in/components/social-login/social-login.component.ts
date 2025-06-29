import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SignInService } from '@app/core/services/signIn.service';
import { createAuthInLS } from '@app/core/utils/auth.utils';
import { AlertType } from '@app/shared/models/alerts.model';
import { IStoreUserCredential } from '@app/shared/models/user.model';
import { UserState } from '@app/store/user/user.reducer';
import { Store } from '@ngrx/store';
import * as UserSelectors from '@store/user/user.selectors';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AvailableProvidersModalComponent } from '../available-providers-modal/available-providers-modal.component';
import { AuthService } from '@app/core/authentication/auth.service';
import { signInModalIcons } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SignInUtilsService } from '../../services/signInUtils.service';
import { SocialProvider } from '@app/shared/models/auth.model';

@Component({
  selector: 'sign-in-social-login',
  imports: [FontAwesomeModule],
  templateUrl: './social-login.component.html',
  styleUrl: './social-login.component.scss',
  providers: [BsModalService, SignInService, SignInUtilsService],
})
export class SocialLoginComponent {
  @Input({ required: true }) alerts: AlertType[] = [];

  private readonly store = inject(Store<UserState>);
  private readonly signInService = inject(SignInService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly utilsService = inject(SignInUtilsService);

  private userStateSubscription!: Subscription;
  private readonly subscriptions = new Subscription();

  readonly icons = signInModalIcons;

  signInWithSocial(provider: SocialProvider) {
    this.dispatchSocialLogin(provider);
    this.handleSocialLoginResponse();
  }

  private dispatchSocialLogin(provider: SocialProvider): void {
    switch (provider) {
      case 'facebook':
        this.signInService.signInWithFacebookDispatch();
        break;
      case 'twitter':
        this.signInService.signInWithTwitterDispatch();
        break;
      case 'google':
        this.signInService.signInWithGoogleDispatch();
        break;
    }
  }

  private handleSocialLoginResponse() {
    this.clearAlerts();
    this.userStateSubscription = this.store
      .select(UserSelectors.selectUserState)
      .subscribe((userState) => this.processSocialLoginState(userState));
  }

  private clearAlerts(): void {
    this.alerts = [];
  }

  private processSocialLoginState(userState: UserState) {
    if (userState.errorMessage) {
      this.alerts.push(
        this.utilsService.showErrorAlert(userState.errorMessage)
      );
    } else if (userState.email && userState.user?.userCredential) {
      this.completeSocialLogin(userState.user.userCredential);
    } else if (userState.email) {
      this.handleAlternativeProviders(userState.email);
    }
  }

  private completeSocialLogin(credential: IStoreUserCredential): void {
    createAuthInLS(credential);
    this.router.navigate(['/']);
    this.unsubscribeUserState();
  }

  private handleAlternativeProviders(email: string): void {
    this.subscriptions.add(
      this.authService.signInWithAnotherMethods(email).subscribe({
        next: (providers) => this.showProvidersModal(providers),
        complete: () => this.unsubscribeUserState(),
      })
    );
  }

  private showProvidersModal(providers: string[]) {
    this.utilsService.showModal(AvailableProvidersModalComponent, {
      initialState: {
        availableProviders: providers,
      },
    });
  }

  private unsubscribeUserState(): void {
    this.userStateSubscription.unsubscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.unsubscribeUserState();
  }
}
