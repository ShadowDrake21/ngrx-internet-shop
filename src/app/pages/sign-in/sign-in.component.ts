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
import { IUser } from '../../shared/models/user.model';
import { ResetPasswordModalComponent } from './components/reset-password-modal/reset-password-modal.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

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

  formSubmitted: boolean = false;

  ngOnInit(): void {
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
  }

  onFormSubmit() {
    this.formSubmitted = true;
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
        console.log('error message', user);

        if (user?.userCredential && this.formSubmitted) {
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
          localStorage.setItem(
            'ngrx-user-credential',
            JSON.stringify(updatedUserCredential)
          );

          this.router.navigate([this.previousRoute]);
        } else {
          this.alerts.push({
            type: 'danger',
            msg: `Incorrect user credential!`,
            timeout: 5000,
          });

          this.signInForm.reset();
          this.signInForm.controls.rememberMe.setValue(true);
        }

        this.formSubmitted = false;
      });
  }

  openResetPasswordModal() {
    this.bsModalRef = this.modalService.show(ResetPasswordModalComponent);
    this.bsModalRef.setClass('reset-password__modal modal-dialog-centered');
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onClose() {
    this.router.navigate([this.previousRoute]);
  }
}
