// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, Subject, Subscription, takeUntil } from 'rxjs';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

// interfaces
import { IUser, IUserSignUpData } from '@models/user.model';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserActions from '@store/user/user.actions';
import * as UserSelectors from '@store/user/user.selectors';

// utils
import { createAuthInLS } from '@core/utils/auth.utils';

// components
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { EmailVerificationModalComponent } from './components/email-verification-modal/email-verification-modal.component';
import { ISingUpForm } from '@app/shared/models/auth.model';
import { SignUpService } from '@app/core/services/sign-up.service';
import { FormErrorMessagesComponent } from './components/form-error-messages/form-error-messages.component';

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    LoaderComponent,
    RouterLink,
    FormErrorMessagesComponent,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  providers: [BsModalService],
})
export class SignUpComponent implements OnDestroy {
  readonly refreshIcon = faRefresh;
  private readonly destroy$ = new Subject<void>();

  private readonly store = inject(Store<UserState>);
  private readonly router = inject(Router);
  private readonly modalService = inject(BsModalService);
  private readonly signUpFormService = inject(SignUpService);

  private bsModalRef?: BsModalRef;

  error$: Observable<string | null> = this.store.select(
    UserSelectors.selectErrorMessage
  );
  signUpForm: ISingUpForm = this.signUpFormService.getSignUpForm();
  isLogging: boolean = false;

  onFormSubmit() {
    if (this.signUpForm.invalid) return;

    this.isLogging = true;
    this.store.dispatch(UserActions.clearUserState());
    this.store.dispatch(UserActions.signUp({ data: this.formSignUpObj() }));

    this.store
      .select(UserSelectors.selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => this.handleSignUpSuccess(user));

    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => this.handleSignUpError(error));
  }

  private formSignUpObj(): IUserSignUpData {
    const { email, password, displayName } = this.signUpForm.value;
    return {
      email: email!,
      password: password!,
      displayName: displayName!,
    };
  }

  private handleSignUpSuccess(user: IUser | null): void {
    if (user?.online) {
      createAuthInLS(user.userCredential!);
      this.isLogging = false;
      this.router.navigate(['/']);
      this.bsModalRef = this.modalService.show(EmailVerificationModalComponent);
    }
  }

  private handleSignUpError(error: string | null): void {
    if (!error) return;

    this.isLogging = false;
    this.signUpForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
