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
import { filter, pairwise } from 'rxjs';
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

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  facebookIcon = faFacebookF;
  googleIcon = faGoogle;
  xIcon = faXTwitter;
  close = faClose;

  private store = inject(Store<UserState>);
  private routingService = inject(RoutingService);
  private router = inject(Router);

  previousRoute!: string;

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
  });

  ngOnInit(): void {
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
  }

  onFormSubmit() {
    this.store.dispatch(
      UserActions.signInManually({
        email: this.signInForm.value.email as string,
        password: this.signInForm.value.password as string,
      })
    );
    this.router.navigate([this.previousRoute]);
  }

  // addErrorAlert(controlName: string) {
  //   console.log('alert error');
  //   const errorMessage = this.formAlertErrorMessage(controlName);
  //   if (errorMessage) {
  //     this.alerts.push({ type: 'danger', msg: errorMessage, timeout: 6000 });
  //   }
  // }

  // formAlertErrorMessage(controlName: string): string | null {
  //   let error: HTMLElement | null
  //   switch (controlName) {
  //     case 'email':

  //       if (this.signInForm.controls.email.hasError('minlength')) {
  //         errorString = 'Minimal length of an email should be 6';
  //       } else if (this.signInForm.controls.email.hasError('required')) {
  //         errorString = 'The email field is mandatory';
  //       } else if (this.signInForm.controls.email.hasError('email')) {
  //         errorString = 'The inputted string is not an email';
  //       }
  //       break;
  //     case 'password':
  //       if (this.signInForm.controls.password.hasError('required')) {
  //         errorString = 'The password field is mandatory';
  //       } else if (this.signInForm.controls.password.hasError('minlength')) {
  //         errorString = 'Minimal length of an password should be 6';
  //       } else if (this.signInForm.controls.password.hasError('maxlength')) {
  //         errorString = 'Maximum length of an password should be 20';
  //       }
  //       break;
  //   }

  //   return errorString;
  // }

  onClose() {
    this.router.navigate([this.previousRoute]);
  }
}
