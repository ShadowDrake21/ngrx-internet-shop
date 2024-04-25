import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFacebookF,
  faGoogle,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { debounceTime, Observable, Subscription, take, takeLast } from 'rxjs';
import { RoutingService } from '../../core/services/routing.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserState } from '../../store/user/user.reducer';

import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AlertType } from '../../shared/models/alerts.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { IStoreUserCredential, IUser } from '../../shared/models/user.model';
import { ResetPasswordModalComponent } from './components/reset-password-modal/reset-password-modal.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { AuthService } from '../../core/authentication/auth.service';
import { AvailableProvidersModalComponent } from './components/available-providers-modal/available-providers-modal.component';

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
  providers: [BsModalService],
})
export class SignInComponent implements OnInit {
  facebookIcon = faFacebookF;
  googleIcon = faGoogle;
  xIcon = faXTwitter;
  close = faClose;

  private store = inject(Store<UserState>);
  private routingService = inject(RoutingService);
  private router = inject(Router);
  private modalService = inject(BsModalService);
  private authService = inject(AuthService);

  previousRoute!: string;

  user$!: Observable<IUser | null>;

  alerts: AlertType[] = [];

  bsModalRef?: BsModalRef;

  private userStateSubscription!: Subscription | undefined;

  signInForm = new FormGroup({
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

  isLogging: boolean = false;

  ngOnInit(): void {
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
  }

  onFormSubmit() {
    this.isLogging = true;
    this.alerts = [];

    this.store.dispatch(
      UserActions.signInManually({
        email: this.signInForm.value.email as string,
        password: this.signInForm.value.password as string,
      })
    );

    this.store
      .select(UserSelectors.selectUser)
      .pipe(debounceTime(5000), take(1))
      .subscribe((user) => {
        if (user?.userCredential && this.isLogging) {
          const now = new Date();
          const updatedUserCredential = {
            ...user.userCredential,
            tokenResult: {
              ...user.userCredential.tokenResult,
              expirationTime: this.signInForm.value.rememberMe
                ? new Date(now.setMonth(now.getMonth() + 3)).toUTCString()
                : user?.userCredential.tokenResult.expirationTime,
            },
          };
          this.createAuthInLS(updatedUserCredential);

          this.goToPrevious();
        } else {
          this.alerts.push({
            type: 'danger',
            msg: `Incorrect user credential!`,
            timeout: 5000,
          });

          this.signInForm.reset();
          this.signInForm.controls.rememberMe.setValue(true);
        }

        this.isLogging = false;
      });
  }

  openResetPasswordModal() {
    this.bsModalRef = this.modalService.show(ResetPasswordModalComponent);
    this.bsModalRef.setClass('reset-password__modal modal-dialog-centered');
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openAvailableProvidersModal(providers: string[]) {
    const initialState: ModalOptions = {
      initialState: {
        availableProviders: providers,
      },
    };
    this.bsModalRef = this.modalService.show(
      AvailableProvidersModalComponent,
      initialState
    );
    this.bsModalRef.setClass('modal-dialog-centered');
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  signInWithFB() {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithFacebook());
    this.signInWithSocialsResults();
  }

  signInWithTwitter() {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithTwitter());
    this.signInWithSocialsResults();
  }

  signInWithGoogle() {
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithGoogle());
    this.signInWithSocialsResults();
  }

  signInWithSocialsResults() {
    this.userStateSubscription = this.store
      .select(UserSelectors.selectUserState)
      .subscribe((userState) => {
        if (userState.errorMessage) {
          console.log(userState.errorMessage);
        } else if (userState.email && userState.user?.userCredential) {
          this.createAuthInLS(userState.user?.userCredential!);
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

  createAuthInLS(userCredential: IStoreUserCredential) {
    localStorage.setItem(
      'ngrx-user-credential',
      JSON.stringify(userCredential)
    );
  }

  goToPrevious() {
    this.router.navigate([this.previousRoute]);
  }
}
