// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

// interfaces
import { IUserSignUpData } from '../../shared/models/user.model';

// created ngrx stuff
import { UserState } from '../../store/user/user.reducer';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';

// utils
import { createAuthInLS } from '../../core/utils/auth.utils';

// components
import { LoaderComponent } from '../../shared/components/loader/loader.component';
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
export class SignUpComponent {
  refreshIcon = faRefresh;

  private store = inject(Store<UserState>);
  private router = inject(Router);
  private modalService = inject(BsModalService);

  bsModalRef?: BsModalRef;

  error$!: Observable<string | null>;

  usernamePattern =
    '^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$';
  signUpForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
      Validators.pattern(this.usernamePattern),
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

  private userSubcription!: Subscription;
  private errorSubcription!: Subscription;

  onFormSubmit() {
    this.isLogging = true;

    this.store.dispatch(UserActions.clearUserState());
    const signUpData: IUserSignUpData = {
      email: this.signUpForm.value.email!,
      password: this.signUpForm.value.password!,
      username: this.signUpForm.value.username!,
    };

    this.store.dispatch(UserActions.signUp({ data: signUpData }));
    this.userSubcription = this.store
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

        if (this.userSubcription) {
          this.userSubcription.unsubscribe();
        }
      });

    this.error$ = this.store.select(UserSelectors.selectErrorMessage);
    this.errorSubcription = this.error$.subscribe((error) => {
      if (error) {
        setTimeout(() => {
          this.error$ = of(null);
        }, 5000);
        this.isLogging = false;
        this.signUpForm.reset();
      }

      if (this.errorSubcription) {
        this.errorSubcription.unsubscribe();
      }
    });
  }
}
