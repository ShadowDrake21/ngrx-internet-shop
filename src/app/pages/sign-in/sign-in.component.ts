import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFacebookF,
  faGoogle,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import {
  debounceTime,
  delay,
  delayWhen,
  filter,
  Observable,
  pairwise,
  take,
  tap,
} from 'rxjs';
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
import { UserCredential } from 'firebase/auth';

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

  signInViaFacebook() {
    this.isLogging = true;
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInViaFacebook());

    this.store.select(UserSelectors.selectUser).subscribe((user) => {
      if (user?.userCredential) {
        this.createAuthInLS(user?.userCredential!);
        this.goToPrevious();
        this.isLogging = false;
      }
    });

    this.store
      .select(UserSelectors.selectErrorMessage)
      .subscribe((errorMessage) => {
        if (errorMessage) {
          this.isLogging = false;
        }
      });
  }

  signInViaFB() {
    // const email = await this.authService.signInViaFB();
    // console.log(email);
    // this.authService.signInWithAnotherMethods(email).then((values) => {
    //   console.log(values);
    //   if (values[0] === 'google.com') {
    //     this.signInViaGoogle();
    //   }
    // });

    this.authService
      .signInViaFB()
      .subscribe((data: UserCredential | string) => {
        if (typeof data === 'string') {
          console.log('string', data);
        } else {
          console.log('UserCredential', data);
        }
      });

    // if()
    // .then((value) => {
    //   console.log(value);
    // })
    // .catch((err) => {
    //   console.log(err);
    // });
  }

  signInViaTwitter() {
    // this.store.dispatch(UserActions.signInViaTwitter());

    // this.store.select(UserSelectors.selectUser).subscribe((user) => {
    //   console.log(user);
    // });

    this.authService
      .signInViaTwitter()
      .subscribe((data: UserCredential | string) => {
        if (typeof data === 'string') {
          console.log('string', data);
        } else {
          console.log('UserCredential', data);
        }
      });
    // .then((result: UserCredential) => {
    //   console.log(result);
    // })
    // .catch((error) => {
    //   if (error.code === 'auth/account-exists-with-different-credential') {
    //     const email = error.email;
    //     let pendingCred = error;
    //     console.log('pending cred', error);
    // this.authService.signInWithAnotherMethods(email).then((methods) => {
    //   console.log(methods);
    // });
    //   }
    // });
  }

  signInViaGoogle() {
    this.authService
      .signInViaGoogle()
      .subscribe((data: UserCredential | string) => {
        if (typeof data === 'string') {
          console.log('string', data);
        } else {
          console.log('UserCredential', data);
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
