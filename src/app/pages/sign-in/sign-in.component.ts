// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import { debounceTime, Observable, Subscription, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Router, RouterLink } from '@angular/router';

// services
import { AuthService } from '../../core/authentication/auth.service';
import { SignInService } from '../../core/services/signIn.service';

// created ngrx stuff
import { UserState } from '../../store/user/user.reducer';
import * as UserSelectors from '../../store/user/user.selectors';

// interfaces and types
import { AlertType } from '../../shared/models/alerts.model';
import { IUser } from '../../shared/models/user.model';

// components
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ResetPasswordModalComponent } from './components/reset-password-modal/reset-password-modal.component';
import { AvailableProvidersModalComponent } from './components/available-providers-modal/available-providers-modal.component';

// utils
import { createAuthInLS } from '../../core/utils/auth.utils';
import { signInModalIcons } from '../../shared/utils/icons.utils';

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
    RouterLink,
  ],

  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  providers: [BsModalService, SignInService],
})
export class SignInComponent implements OnInit, OnDestroy {
  icons = signInModalIcons;

  private store = inject(Store<UserState>);
  private modalService = inject(BsModalService);
  private authService = inject(AuthService);
  private signInService = inject(SignInService);
  private router = inject(Router);

  previousRoute!: string;
  bsModalRef?: BsModalRef;

  alerts: AlertType[] = [];
  user$!: Observable<IUser | null>;

  signInForm!: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    rememberMe: FormControl<boolean | null>;
  }>;
  isLogging: boolean = false;

  private userStateSubscription!: Subscription | undefined;
  private subscriptions: Subscription[] = [];

  private modalsClasses = 'sign-in__modals modal-dialog-centered';

  ngOnInit(): void {
    this.signInForm = this.signInService.getSignInForm();
  }

  onFormSubmit() {
    this.isLogging = true;
    this.alerts = [];

    this.signInService.signInManuallyDispatch();

    const userSubscription: Subscription = this.store
      .select(UserSelectors.selectUser)
      .pipe(debounceTime(5000), take(1))
      .subscribe((user) => {
        if (user?.userCredential && this.isLogging) {
          this.signInService.signInManuallyFormReducedUserCredential(
            user.userCredential!,
            this.signInForm.value.rememberMe!
          );

          this.router.navigate(['/']);
        } else {
          const errorSubscription: Subscription = this.store
            .select(UserSelectors.selectErrorMessage)
            .subscribe((errorMessage) => {
              if (errorMessage) {
                this.alerts.push(
                  this.signInService.setAlert('danger', errorMessage!, 5000)
                );
                this.signInForm.reset();
                this.signInForm.controls.rememberMe.setValue(true);
              }
            });
          this.subscriptions.push(errorSubscription);
        }
        this.isLogging = false;
      });

    this.subscriptions.push(userSubscription);
  }

  openResetPasswordModal() {
    this.bsModalRef = this.modalService.show(ResetPasswordModalComponent);
    this.setModalFeatures(this.modalsClasses);
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
    this.setModalFeatures(this.modalsClasses);
  }

  signInWithSocial(socialName: 'facebook' | 'twitter' | 'google') {
    switch (socialName) {
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
          createAuthInLS(userState.user.userCredential);

          this.router.navigate(['/']);
          if (this.userStateSubscription) {
            this.userStateSubscription.unsubscribe();
          }
        } else if (userState.email && !userState.user?.userCredential) {
          const signInWithAnotherMethodsSubscription = this.authService
            .signInWithAnotherMethods(userState.email)
            .subscribe((providers) => {
              this.openAvailableProvidersModal(providers);

              if (this.userStateSubscription) {
                this.userStateSubscription.unsubscribe();
              }
            });

          this.subscriptions.push(signInWithAnotherMethodsSubscription);
        }
      });
  }

  setModalFeatures(classStr: string) {
    this.bsModalRef?.setClass(classStr);
    this.bsModalRef!.content.closeBtnName = 'Close';
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((subscribtion) => subscribtion.unsubscribe());
    }
  }
}
