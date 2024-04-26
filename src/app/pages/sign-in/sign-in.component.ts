import { Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import { debounceTime, Observable, Subscription, take } from 'rxjs';
import { RoutingService } from '../../core/services/routing.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserState } from '../../store/user/user.reducer';

import * as UserSelectors from '../../store/user/user.selectors';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AlertType } from '../../shared/models/alerts.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { IUser } from '../../shared/models/user.model';
import { ResetPasswordModalComponent } from './components/reset-password-modal/reset-password-modal.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AuthService } from '../../core/authentication/auth.service';
import { AvailableProvidersModalComponent } from './components/available-providers-modal/available-providers-modal.component';
import { createAuthInLS } from '../../core/utils/auth.utils';
import { signInModalIcons } from '../../shared/utils/icons.utils';
import { SignInService } from '../../core/services/signIn.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    AlertComponent,
    LoaderComponent,
    ResetPasswordModalComponent,
    AvailableProvidersModalComponent,
  ],

  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  providers: [BsModalService, SignInService],
})
export class SignInComponent implements OnInit {
  icons = signInModalIcons;

  private store = inject(Store<UserState>);
  private routingService = inject(RoutingService);
  private modalService = inject(BsModalService);
  private authService = inject(AuthService);
  private signInService = inject(SignInService);

  previousRoute!: string;
  bsModalRef?: BsModalRef;

  alerts: AlertType[] = [];
  user$!: Observable<IUser | null>;
  private userStateSubscription!: Subscription | undefined;

  signInForm!: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    rememberMe: FormControl<boolean | null>;
  }>;

  isLogging: boolean = false;

  ngOnInit(): void {
    this.signInForm = this.signInService.getSignInForm();
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
  }

  onFormSubmit() {
    this.isLogging = true;
    this.alerts = [];

    this.signInService.signInManuallyDispatch();

    this.store
      .select(UserSelectors.selectUser)
      .pipe(debounceTime(5000), take(1))
      .subscribe((user) => {
        if (user?.userCredential && this.isLogging) {
          this.signInService.signInManuallyFormReducedUserCredential(
            user.userCredential
          );

          this.goToPrevious();
        } else {
          this.alerts.push(
            this.signInService.setAlert(
              'danger',
              'Incorrect user credential!',
              5000
            )
          );

          this.signInForm.reset();
          this.signInForm.controls.rememberMe.setValue(true);
        }

        this.isLogging = false;
      });
  }

  openResetPasswordModal() {
    this.bsModalRef = this.modalService.show(ResetPasswordModalComponent);
    this.setModalFeatures('sign-in__modals modal-dialog-centered');
  }

  openAvailableProvidersModal(providers: string[]) {
    const initialState: ModalOptions = {
      initialState: {
        availableProviders: providers,
        previousRoute: this.previousRoute,
      },
    };
    this.bsModalRef = this.modalService.show(
      AvailableProvidersModalComponent,
      initialState
    );
    this.setModalFeatures('sign-in__modals modal-dialog-centered');
  }

  signInWithFacebook() {
    this.signInService.signInWithFacebookDispatch();
    this.signInWithSocialsResults();
  }

  signInWithTwitter() {
    this.signInService.signInWithTwitterDispatch();
    this.signInWithSocialsResults();
  }

  signInWithGoogle() {
    this.signInService.signInWithGoogleDispatch();
    this.signInWithSocialsResults();
  }

  signInWithSocialsResults() {
    this.alerts = [];
    this.userStateSubscription = this.store
      .select(UserSelectors.selectUserState)
      .subscribe((userState) => {
        if (userState.errorMessage) {
          this.alerts.push(
            this.signInService.setAlert('danger', userState.errorMessage, 5000)
          );
        } else if (userState.email && userState.user?.userCredential) {
          createAuthInLS(userState.user?.userCredential!);
          this.goToPrevious();
          if (this.userStateSubscription) {
            this.userStateSubscription.unsubscribe();
          }
        } else if (userState.email && !userState.user?.userCredential) {
          this.authService
            .signInWithAnotherMethods(userState.email)
            .subscribe((providers) => {
              this.openAvailableProvidersModal(providers);

              if (this.userStateSubscription) {
                this.userStateSubscription.unsubscribe();
              }
            });
        }
      });
  }

  setModalFeatures(classStr: string) {
    this.bsModalRef?.setClass(classStr);
    this.bsModalRef!.content.closeBtnName = 'Close';
  }

  goToPrevious() {
    this.routingService.goToPreviousPage(this.previousRoute);
  }
}
