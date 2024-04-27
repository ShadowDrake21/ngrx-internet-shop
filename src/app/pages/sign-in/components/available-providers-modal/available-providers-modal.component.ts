// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { debounceTime, Observable, Subscription, take } from 'rxjs';
import { Store } from '@ngrx/store';

// interfaces
import { IUser } from '../../../../shared/models/user.model';

// services
import { RoutingService } from '../../../../core/services/routing.service';
import { SignInService } from '../../../../core/services/signIn.service';

// created ngrx stuff
import { UserState } from '../../../../store/user/user.reducer';
import * as UserSelectors from '../../../../store/user/user.selectors';

// components
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

// utils
import { createAuthInLS } from '../../../../core/utils/auth.utils';
import { signInModalIcons } from '../../../../shared/utils/icons.utils';

@Component({
  selector: 'app-available-providers-modal',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    LoaderComponent,
    AlertComponent,
  ],
  templateUrl: './available-providers-modal.component.html',
  styleUrl: './available-providers-modal.component.scss',
  providers: [SignInService],
})
export class AvailableProvidersModalComponent implements OnInit, OnDestroy {
  icons = signInModalIcons;

  private store = inject(Store<UserState>);
  private routingService = inject(RoutingService);
  private signInService = inject(SignInService);
  public bsModalRef = inject(BsModalRef);

  availableProviders: string[] = [];
  previousRoute!: string;
  closeBtnName?: string;

  errorMessage!: string;
  user$!: Observable<IUser | null>;

  private userSubscription: Subscription[] = [];

  signInForm!: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    rememberMe: FormControl<boolean | null>;
  }>;
  isLogging: boolean = false;

  ngOnInit(): void {
    this.signInForm = this.signInService.getSignInForm();
  }
  onFormSubmit() {
    this.isLogging = true;

    this.signInService.signInManuallyDispatch();

    const signInManuallySubscription: Subscription = this.store
      .select(UserSelectors.selectUser)
      .pipe(debounceTime(5000), take(1))
      .subscribe((user) => {
        if (user?.userCredential && this.isLogging) {
          this.signInService.signInManuallyFormReducedUserCredential(
            user.userCredential
          );

          this.routingService.goToPreviousPage(this.previousRoute);
          this.bsModalRef.hide();
        } else {
          this.errorMessage = 'Incorrect user credential!';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
          this.signInForm.reset();
          this.signInForm.controls.rememberMe.setValue(true);
          // this.bsModalRef.hide();
        }

        this.isLogging = false;
      });
    this.addSubscription(signInManuallySubscription);
  }

  signInWithFacebook() {
    this.isLogging = true;
    this.signInService.signInWithFacebookDispatch();

    const signInWithFacebookSubscription: Subscription =
      this.handleDataManupulationsInSignInWithSocials();
    this.addSubscription(signInWithFacebookSubscription);
  }

  signInWithTwitter() {
    this.isLogging = true;
    this.signInService.signInWithTwitterDispatch();

    const signInWithTwitterSubscription: Subscription =
      this.handleDataManupulationsInSignInWithSocials();
    this.addSubscription(signInWithTwitterSubscription);
  }

  signInWithGoogle() {
    this.isLogging = true;
    this.signInService.signInWithGoogleDispatch();

    const signInWithGoogleSubscription: Subscription =
      this.handleDataManupulationsInSignInWithSocials();
    this.addSubscription(signInWithGoogleSubscription);
  }

  private handleDataManupulationsInSignInWithSocials(): Subscription {
    return this.store.select(UserSelectors.selectUser).subscribe((user) => {
      console.log('UserSelectors.selectUser', user);
      if (user !== null && user.userCredential) {
        createAuthInLS(user?.userCredential!);

        this.routingService.goToPreviousPage(this.previousRoute);
        this.bsModalRef.hide();
        this.isLogging = false;
      }
    });
  }
  addSubscription(subscription: Subscription) {
    this.userSubscription.push(subscription);
  }

  ngOnDestroy(): void {
    this.userSubscription.forEach((subscription) => subscription.unsubscribe());
  }
}
