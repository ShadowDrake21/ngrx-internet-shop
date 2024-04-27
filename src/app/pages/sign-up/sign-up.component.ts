import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserState } from '../../store/user/user.reducer';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import { IUserSignUpData } from '../../shared/models/user.model';
import { Router } from '@angular/router';
import { delay, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { createAuthInLS } from '../../core/utils/auth.utils';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { EmailVerificationModalComponent } from './components/email-verification-modal/email-verification-modal.component';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    LoaderComponent,
    EmailVerificationModalComponent,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  providers: [BsModalService],
})
export class SignUpComponent implements OnDestroy {
  refreshIcon = faRefresh;

  private store = inject(Store<UserState>);
  private router = inject(Router);
  private modalService = inject(BsModalService);

  bsModalRef?: BsModalRef;

  error$!: Observable<string | null>;

  signUpForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
      Validators.pattern(
        '^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$'
      ),
    ]),
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
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
  });
  isLogging: boolean = false;

  subscriptions: Subscription[] = [];

  onFormSubmit() {
    this.isLogging = true;

    this.store.dispatch(UserActions.clearUserState());
    const signUpData: IUserSignUpData = {
      email: this.signUpForm.value.email!,
      password: this.signUpForm.value.password!,
      username: this.signUpForm.value.username!,
    };

    this.store.dispatch(UserActions.signUp({ data: signUpData }));
    const userSubcription: Subscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        if (user?.online) {
          createAuthInLS(user.userCredential!);
          this.isLogging = false;
          this.router.navigate(['/']);

          this.store.dispatch(UserActions.sendEmailVerification());
          this.bsModalRef = this.modalService.show(
            EmailVerificationModalComponent
          );
        }
      });

    this.subscriptions.push(userSubcription);

    this.error$ = this.store.select(UserSelectors.selectErrorMessage);
    const errorSubcription: Subscription = this.error$.subscribe((error) => {
      if (error) {
        setTimeout(() => {
          this.error$ = of(null);
        }, 5000);
        this.isLogging = false;
        this.signUpForm.reset();
      }
    });

    this.subscriptions.push(errorSubcription);
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
  }
}
