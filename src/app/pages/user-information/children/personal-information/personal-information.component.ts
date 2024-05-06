import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';
import {
  forkJoin,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { IStoreUserCredential, IUser } from '@app/shared/models/user.model';

import * as UserSelectors from '@store/user/user.selectors';
import * as UserActions from '@store/user/user.actions';
import { AuthService } from '@app/core/authentication/auth.service';
import { MEDIA_STORAGE_PATH } from '@app/core/constants/storage.constants';
import { StorageService } from '@app/core/services/storage.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { createAuthInLS } from '@app/core/utils/auth.utils';
import { minimalizeUserCredential } from '@app/shared/utils/store.utils';
import { faGear, faKey } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertComponent } from '@app/shared/components/alert/alert.component';
import { AlertType } from '@app/shared/models/alerts.model';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ReauthenticateModalComponent } from './component/reauthenticate-modal/reauthenticate-modal.component';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    AlertComponent,
    ReauthenticateModalComponent,
  ],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
  providers: [BsModalService],
})
export class PersonalInformationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  userInformationItem = userInformationContent[1];
  settingsIcon = faGear;
  passwordIcon = faKey;

  @ViewChild('changeImageEl') changeImageEl!: ElementRef<HTMLDivElement>;
  @ViewChild('changeImageInput')
  changeImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ReauthenticateModalComponent)
  reauthModal!: ReauthenticateModalComponent;

  private store = inject(Store<UserState>);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);
  private modalService = inject(BsModalService);

  bsModalRef?: BsModalRef;

  user$!: Observable<IUser | null>;

  isChangeMode: boolean = false;

  wasEmailVerificationSent: boolean = false;
  wasUserReauthenticated: boolean = false;

  updatedUserPhotoFile: File | null = null;
  userPhotoURL: string | null = null;

  previousDisplayName: string | null = null;

  isPasswordChangeMode: boolean = false;
  newPassword: string = '';

  controlButtonsActive: boolean = false;
  saveButtonActive: boolean = false;

  alerts: AlertType[] = [];

  changePasswordForm!: FormGroup;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
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

    this.user$ = this.store.select(UserSelectors.selectUser);
    const userSubscription = this.user$.subscribe((user) => {
      this.userPhotoURL = user?.userCredential?.providerData[0].photoURL!;
    });

    this.subscriptions.push(userSubscription);
  }

  ngAfterViewInit(): void {
    this.changeProfile();
  }

  changeProfile() {
    const changeEl = this.changeImageEl.nativeElement;
    const changeInput = this.changeImageInput.nativeElement;

    changeEl.addEventListener('click', () => {
      changeInput.click();
    });

    changeInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        if (!this.controlButtonsActive) {
          this.controlButtonsActive = true;
        }

        this.updatedUserPhotoFile = file;
        this.userPhotoURL = URL.createObjectURL(file);
      }

      this.updateSaveButtonState();
    });
  }

  private updateSaveButtonState() {
    if (!this.updatedUserPhotoFile) {
      this.saveButtonActive = false;
    } else {
      this.saveButtonActive = true;
    }
  }

  onSaveChanges() {
    if (!this.saveButtonActive) {
      return;
    }

    this.alerts = [];

    const userSubscription = this.store
      .select(UserSelectors.selectUser)
      .pipe(
        take(1),
        switchMap((user) => {
          if (this.updatedUserPhotoFile) {
            const mediaFolderPath = `${MEDIA_STORAGE_PATH}/profilePhotos/${user?.userCredential?.providerData[0].uid}/`;
            console.log('mediaFolderPath', mediaFolderPath);
            return this.storageService.updateFileAndGetDownloadURL(
              mediaFolderPath,
              this.updatedUserPhotoFile!
            );
          } else {
            return of(null);
          }
        }),
        switchMap((url) => {
          return this.authService.setProfileImage(url!);
        })
      )
      .subscribe({
        next: () => {
          this.store.dispatch(UserActions.getUser());
          this.buttonCancelEffects();
          this.updateLocalStorageData();
        },
        error: (error) => {
          this.alerts.push({
            type: 'danger',
            timeout: 5000,
            msg: error.message,
          });
        },
      });

    this.subscriptions.push(userSubscription);
  }

  updateLocalStorageData() {
    const storeSubscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        let updatedUserCredential = user?.userCredential;

        if (updatedUserCredential) {
          const updatedUserCredentialObj: IStoreUserCredential = {
            ...updatedUserCredential,
            tokenResult: {
              ...updatedUserCredential.tokenResult,
              expirationTime: this.getExistingExpirationTime(),
            },
          };

          createAuthInLS(updatedUserCredentialObj);
        }
      });

    this.subscriptions.push(storeSubscription);
  }

  getExistingExpirationTime(): string {
    let expirationTime = '';
    const userCredentialStrFromLS = localStorage.getItem(
      'ngrx-user-credential'
    );

    if (userCredentialStrFromLS) {
      let userCredentialFromLS = JSON.parse(
        userCredentialStrFromLS
      ) as IStoreUserCredential;

      expirationTime = userCredentialFromLS.tokenResult.expirationTime;
    }

    return expirationTime;
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
    this.store
      .select(UserSelectors.selectEmail)
      .pipe(take(1))
      .subscribe((email) => {
        this.openModalWithComponent(email!, 'changePassword');
        this.isPasswordChangeMode = false;
      });
  }

  onReauthenticateUser() {
    this.alerts = [];
    this.store
      .select(UserSelectors.selectEmail)
      .pipe(take(1))
      .subscribe((email) =>
        this.openModalWithComponent(email!, 'reauthentication')
      );
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
    this.bsModalRef.content.closeBtnName = 'Close';

    this.reauthModal = this.bsModalRef.content;

    const onHiddenSubscription = this.bsModalRef.onHidden?.subscribe(() => {
      if (this.reauthModal.isSuccessReauthentication) {
        if (this.reauthModal.isChangePassword) {
          this.authService
            .updatePassword(this.changePasswordForm.value.password)
            .then((value: string) => {
              this.alerts.push({
                type: 'success',
                timeout: 5000,
                msg: value,
              });
              this.passwordControl.reset();
            });
        } else {
          this.alerts.push({
            type: 'success',
            timeout: 5000,
            msg: 'User reauthenticated',
          });
          this.wasUserReauthenticated = true;
        }
      } else {
        if (this.reauthModal.isSuccessReauthentication === null) {
          this.alerts.push({
            type: 'danger',
            timeout: 5000,
            msg: "You've closed the modal window.",
          });
        } else if (this.reauthModal.isSuccessReauthentication === false) {
          this.alerts.push({
            type: 'danger',
            timeout: 5000,
            msg: 'Incorrect user credential. Try one more time.',
          });
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
    this.wasEmailVerificationSent = true;
    this.store.dispatch(UserActions.sendEmailVerification());
    this.alerts.push({
      type: 'info',
      timeout: 5000,
      msg: 'Email verification was sent to your email. Please check it.',
    });
  }

  // password form
  get passwordControl() {
    return this.changePasswordForm.get('password') as FormControl;
  }

  hasErrorChangePasswordForm() {
    const control = this.passwordControl;
    return control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessageChangePasswordForm() {
    const control = this.passwordControl;
    if (control && control.errors) {
      let errorMessages: string[] = [];
      if (control.errors?.['required']) {
        errorMessages.push('The password field is required');
      }
      if (control.errors?.['minlength']) {
        errorMessages.push('A password should be at least 6 characters long');
      }
      if (control.errors?.['maxlength']) {
        errorMessages.push(
          'A password length should be less than or equal to 20'
        );
      }

      return errorMessages;
    }
    return [];
  }

  onCancelChangePasswordForm() {
    this.isPasswordChangeMode = false;
    this.changePasswordForm.reset();
  }
  // password form

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
