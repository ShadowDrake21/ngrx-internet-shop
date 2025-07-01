// angular stuff
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Observable, Subscription, switchMap, take, timer } from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// created ngrx stuff
import { UserState } from '@app/store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';
import * as UserActions from '@store/user/user.actions';

// interfaces
import { IUser } from '@models/user.model';
import { AlertType } from '@models/alerts.model';

// components
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { AlertComponent } from '@shared/components/alert/alert.component';
import { ReauthenticateModalComponent } from './components/reauthenticate-modal/reauthenticate-modal.component';

// content
import { userInformationContent } from '../../content/user-information.content';

// utils
import { createAuthInLS } from '@core/utils/auth.utils';
import { personalInformationIcons } from '@shared/utils/icons.utils';

//services
import { AuthService } from '@core/authentication/auth.service';

// constants
import { PersonalInformationService } from './services/personal-information.service';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { PasswordFormComponent } from './components/password-form/password-form.component';
import { UserImageComponent } from './components/user-image/user-image.component';

@Component({
  selector: 'app-personal-information',
  imports: [
    BasicCardComponent,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    AlertComponent,
    TitleCasePipe,
    AsyncPipe,
    EmailVerificationComponent,
    PasswordFormComponent,
    UserImageComponent,
  ],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
  providers: [BsModalService],
})
export class PersonalInformationComponent implements OnInit, OnDestroy {
  readonly userInformationItem = userInformationContent[1];
  readonly icons = personalInformationIcons;

  @ViewChild(ReauthenticateModalComponent)
  reauthModal!: ReauthenticateModalComponent;

  private readonly store = inject(Store<UserState>);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(BsModalService);
  private readonly fb = inject(FormBuilder);
  private readonly personalInformationService = inject(
    PersonalInformationService
  );

  bsModalRef?: BsModalRef;
  alerts: AlertType[] = [];
  user$: Observable<IUser | null> = this.store.select(UserSelectors.selectUser);
  changePasswordForm!: FormGroup;

  updatedUserPhotoFile: File | null = null;
  isChangeMode: boolean = false;
  wasEmailVerificationSent: boolean = false;
  wasUserReauthenticated: boolean = false;
  userPhotoURL: string | null = null;
  isPasswordChangeMode: boolean = false;
  controlButtonsActive: boolean = false;
  saveButtonActive: boolean = false;
  personalInformationLoading: boolean = false;
  isUserSignInManually: boolean = true;

  private subscriptions: Subscription[] = [];

  constructor() {
    this.initPasswordForm();
  }

  ngOnInit(): void {
    this.personalInformationLoading = true;
    this.initUserData();
    this.initLoadingTimer();
  }

  private initPasswordForm(): void {
    this.changePasswordForm = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20),
        ],
      ],
    });
  }

  private initUserData(): void {
    this.user$ = this.store.select(UserSelectors.selectUser);
    const sub = this.user$.subscribe((user) => {
      this.userPhotoURL = this.personalInformationService.getUserPhotoUrl(user);
      this.isUserSignInManually =
        this.personalInformationService.isManualSignIn(user);
    });
    this.subscriptions.push(sub);
  }

  private initLoadingTimer(): void {
    const timerSubscription = timer(2000).subscribe(
      () => (this.personalInformationLoading = false)
    );
    this.subscriptions.push(timerSubscription);
  }

  onImageChanged(file: File) {
    this.controlButtonsActive = true;
    this.updatedUserPhotoFile = file;
    this.userPhotoURL = URL.createObjectURL(file);
    this.saveButtonActive = true;
  }

  onSaveChanges() {
    if (!this.saveButtonActive) return;

    this.alerts = [];

    const sub = this.store
      .select(UserSelectors.selectUser)
      .pipe(
        take(1),
        switchMap((user) =>
          this.personalInformationService.updateProfileImage(
            user,
            this.updatedUserPhotoFile
          )
        ),
        switchMap((url) => {
          return this.authService.setProfileImage(url || '');
        })
      )
      .subscribe({
        next: () => this.handleSaveSuccess(),
        error: (error) => this.pushNewAlert(error.message),
      });

    this.subscriptions.push(sub);
  }

  private handleSaveSuccess(): void {
    this.store.dispatch(UserActions.getUser());
    this.buttonCancelEffects();
    this.updateLocalStorageData();
    this.pushNewAlert('Image was successfully changed!');
  }

  updateLocalStorageData() {
    const sub = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        const updatedCredential =
          this.personalInformationService.prepareUpdatedCredentials(user);

        if (updatedCredential) {
          createAuthInLS(updatedCredential);
        }
      });
    this.subscriptions.push(sub);
  }

  onCancel() {
    this.buttonCancelEffects();
    this.store.dispatch(UserActions.getUser());
  }

  buttonCancelEffects() {
    this.saveButtonActive = false;
    this.controlButtonsActive = false;
  }

  onSaveNewPassword() {
    this.alerts = [];
    const emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .pipe(take(1))
      .subscribe((email) => {
        this.openModalWithComponent(email!, 'changePassword');
        this.isPasswordChangeMode = false;
      });

    this.subscriptions.push(emailSubscription);
  }

  onReauthenticateUser() {
    this.alerts = [];
    const emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .pipe(take(1))
      .subscribe((email) =>
        this.openModalWithComponent(email!, 'reauthentication')
      );

    this.subscriptions.push(emailSubscription);
  }

  openModalWithComponent(
    email: string,
    usageType: 'changePassword' | 'reauthentication'
  ) {
    const initialState: ModalOptions = {
      initialState: {
        email: email,
        isChangePassword: usageType === 'changePassword' ? true : false,
      },
    };
    this.bsModalRef = this.modalService.show(
      ReauthenticateModalComponent,
      initialState
    );
    this.bsModalRef?.setClass('reauthentication-modal');
    this.bsModalRef.content.closeBtnName = 'Close';

    this.reauthModal = this.bsModalRef.content;

    const onHiddenSubscription = this.bsModalRef.onHidden?.subscribe(() => {
      if (this.reauthModal.isSuccessReauthentication) {
        if (this.reauthModal.isChangePassword) {
          this.authService
            .updatePassword(this.changePasswordForm.value.password)
            .then((value: string) => {
              this.pushNewAlert(value);
              this.passwordControl.reset();
            });
        } else {
          this.pushNewAlert('User reauthenticated');
          this.wasUserReauthenticated = true;
        }
      } else {
        if (this.reauthModal.isSuccessReauthentication === null) {
          this.pushNewAlert("You've closed the modal window.", 'danger');
        } else if (this.reauthModal.isSuccessReauthentication === false) {
          this.pushNewAlert(
            'Incorrect user credential. Try one more time.',
            'danger'
          );
        }

        this.passwordControl.reset();
      }
      onHiddenSubscription?.unsubscribe();
    });

    if (onHiddenSubscription) {
      this.subscriptions.push(onHiddenSubscription);
    }
  }

  onSendEmailVerification() {
    this.alerts = [];
    this.wasEmailVerificationSent = true;
    this.store.dispatch(UserActions.sendEmailVerification());
    this.pushNewAlert(
      'Email verification was sent to your email. Please check it.',
      'info'
    );
  }

  pushNewAlert(msg: string, type: 'success' | 'danger' | 'info' = 'success') {
    this.alerts.push({ timeout: 5000, type, msg });
  }

  get passwordControl() {
    return this.changePasswordForm.get('password') as FormControl;
  }

  onTogglePasswordChange() {
    this.isPasswordChangeMode = !this.isPasswordChangeMode;
  }
  hasErrorChangePasswordForm() {
    const control = this.passwordControl;
    return control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessageChangePasswordForm() {
    return this.personalInformationService.getErrorMessageChangePasswordForm(
      this.passwordControl
    );
  }

  onCancelPasswordChangeForm() {
    this.isPasswordChangeMode = false;
    console.log('Cancel password change form', this.isPasswordChangeMode);
    this.changePasswordForm.reset();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
