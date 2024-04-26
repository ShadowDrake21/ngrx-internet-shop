import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  FaIconComponent,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import {
  faFacebookF,
  faGoogle,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { debounceTime, Observable, Subscription, take } from 'rxjs';
import {
  IStoreUserCredential,
  IUser,
} from '../../../../shared/models/user.model';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../../core/authentication/auth.service';
import { RoutingService } from '../../../../core/services/routing.service';
import { UserState } from '../../../../store/user/user.reducer';
import { AlertType } from '../../../../shared/models/alerts.model';
import * as UserActions from '../../../../store/user/user.actions';
import * as UserSelectors from '../../../../store/user/user.selectors';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-available-providers-modal',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    LoaderComponent,
  ],
  templateUrl: './available-providers-modal.component.html',
  styleUrl: './available-providers-modal.component.scss',
})
export class AvailableProvidersModalComponent implements OnInit, OnDestroy {
  facebookIcon = faFacebookF;
  googleIcon = faGoogle;
  xIcon = faXTwitter;
  close = faClose;

  public bsModalRef = inject(BsModalRef);
  private store = inject(Store<UserState>);
  private routingService = inject(RoutingService);
  private router = inject(Router);

  availableProviders: string[] = [];
  previousRoute!: string;

  alerts: AlertType[] = [];

  closeBtnName?: string;

  user$!: Observable<IUser | null>;
  userSubscription: Subscription[] = [];

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

  ngOnInit(): void {}

  onFormSubmit() {
    this.isLogging = true;
    this.alerts = [];

    this.store.dispatch(
      UserActions.signInManually({
        email: this.signInForm.value.email as string,
        password: this.signInForm.value.password as string,
      })
    );

    const signInManuallySubscription: Subscription = this.store
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
          this.bsModalRef.hide();
        } else {
          this.alerts.push({
            type: 'danger',
            msg: `Incorrect user credential!`,
            timeout: 5000,
          });

          this.signInForm.reset();
          this.signInForm.controls.rememberMe.setValue(true);
          this.bsModalRef.hide();
        }

        this.isLogging = false;
      });
    this.userSubscription.push(signInManuallySubscription);
  }

  signInWithFB() {
    this.isLogging = true;
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithFacebook());

    const signInWithFacebookSubscription: Subscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        console.log('UserSelectors.selectUser', user);
        if (user !== null && user.userCredential) {
          this.createAuthInLS(user?.userCredential!);

          this.goToPrevious();
          this.bsModalRef.hide();
          this.isLogging = false;
        }
      });
    this.userSubscription.push(signInWithFacebookSubscription);
  }

  signInWithTwitter() {
    this.isLogging = true;
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithTwitter());

    const signInWithTwitterSubscription: Subscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        console.log('UserSelectors.selectUser', user);
        if (user !== null && user.userCredential) {
          this.createAuthInLS(user?.userCredential!);

          this.goToPrevious();
          this.bsModalRef.hide();
          this.isLogging = false;
        }
      });
    this.userSubscription.push(signInWithTwitterSubscription);
  }

  signInWithGoogle() {
    this.isLogging = true;
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signInWithGoogle());
    const signInWithGoogleSubscription: Subscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        console.log('UserSelectors.selectUser', user);
        if (user !== null && user.userCredential) {
          this.createAuthInLS(user?.userCredential!);

          this.goToPrevious();
          this.bsModalRef.hide();
          this.isLogging = false;
        }
      });
    this.userSubscription.push(signInWithGoogleSubscription);
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

  ngOnDestroy(): void {
    this.userSubscription.forEach((subscription) => subscription.unsubscribe());
  }
}
