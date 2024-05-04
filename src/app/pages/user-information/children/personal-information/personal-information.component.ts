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
import {
  IStoreUserCredential,
  IUser,
  IUserUpdate,
} from '@app/shared/models/user.model';

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

  @ViewChild('displayName')
  displayName!: ElementRef<HTMLInputElement>;
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

  updatedUserPhotoFile: File | null = null;
  userPhotoURL: string | null = null;

  previousDisplayName: string | null = null;

  isPasswordChangeMode: boolean = false;
  newPassword: string = '';

  controlButtonsActive: boolean = false;
  saveButtonActive: boolean = false;

  alerts: AlertType[] = [];

  changePasswordForm!: FormGroup;
  displayNameControl!: FormControl;

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

    this.displayNameControl = this.fb.control(
      {
        value: '',
        disabled: true,
      },
      [Validators.required, Validators.minLength(6), Validators.maxLength(20)]
    );

    this.user$ = this.store.select(UserSelectors.selectUser);
    const userSubscription = this.user$.subscribe((user) => {
      this.userPhotoURL = user?.userCredential?.providerData[0].photoURL;

      this.previousDisplayName =
        user?.userCredential?.providerData[0].displayName;
      this.displayNameControl.patchValue(this.previousDisplayName);
    });

    this.subscriptions.push(userSubscription);
  }

  ngAfterViewInit(): void {
    this.changeProfile();
  }

  changeProfile() {
    const displayNameInput = this.displayName.nativeElement;
    const changeEl = this.changeImageEl.nativeElement;
    const changeInput = this.changeImageInput.nativeElement;

    displayNameInput.addEventListener('input', () => {
      if (!this.controlButtonsActive) {
        this.controlButtonsActive = true;
      }

      this.updateSaveButtonState();
    });

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
    if (
      !this.updatedUserPhotoFile &&
      this.displayNameControl.value === this.previousDisplayName
    ) {
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

    const userSubscription = this.user$
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
          let updateData: Partial<IUserUpdate> = {};

          if (this.updatedUserPhotoFile) {
            updateData.photoURL = url!;
          }
          if (this.displayNameControl.value !== this.previousDisplayName) {
            updateData.displayName = this.displayNameControl.value;
          }

          console.log('updateData', updateData);

          return this.authService.updateUser(updateData);
        })
      )
      .subscribe({
        next: () => {
          this.onToggleChangeMode();
          this.previousDisplayName = this.displayNameControl.value;
          this.updateLocalStorageData();
        },
        error: (error) => {
          console.log('error', error);
          // this.onToggleChangeMode();
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

  onToggleChangeMode() {
    this.buttonCancelEffects();
    if (
      this.updatedUserPhotoFile ||
      this.previousDisplayName !== this.displayNameControl.value
    ) {
      this.store.dispatch(UserActions.getUser());
    }
  }

  buttonCancelEffects() {
    this.isChangeMode = !this.isChangeMode;
    if (this.isChangeMode) {
      this.displayNameControl.enable();
    } else {
      this.displayNameControl.disable();
    }
    this.controlButtonsActive = false;
  }

  onSaveNewPassword() {
    this.alerts = [];
    this.store
      .select(UserSelectors.selectBasicInfo)
      .pipe(take(1))
      .subscribe((info) => this.openModalWithComponent(info?.email!));

    // .subscribe((result) => {
    //   this.alerts.push({ type: 'success', timeout: 5000, msg: result });
    // });
  }

  handleReauthError(error: string) {
    console.error('Reauthentication error: ', error);
  }

  openModalWithComponent(email: string) {
    let errorOccurred = false;

    const initialState: ModalOptions = {
      initialState: {
        email: email,
      },
    };
    this.bsModalRef = this.modalService.show(
      ReauthenticateModalComponent,
      initialState
    );
    this.bsModalRef.content.closeBtnName = 'Close';

    this.reauthModal = this.bsModalRef.content;

    const onHiddenSubscription = this.bsModalRef.onHidden?.subscribe(() => {
      // dopisać!!!!

      if (this.reauthModal.isSuccessReauthentication) {
        this.authService
          .updatePassword(this.changePasswordForm.value.password)
          .then((value: string) => {
            if (!errorOccurred) {
              this.alerts.push({ type: 'success', timeout: 5000, msg: value });
            }
          })
          .catch((error) => {
            if (!errorOccurred) {
              this.alerts.push({
                type: 'danger',
                timeout: 5000,
                msg: error.message,
              });
            }

            // onHiddenSubscription?.unsubscribe();
          });
      } else {
        this.alerts.push({
          type: 'danger',
          timeout: 5000,
          msg: 'Incorrect user credential. Try one more time.',
        });
      }
      onHiddenSubscription?.unsubscribe();
      // this.subscriptions.push(errorSubcription);

      // const errorSubcription = this.reauthModal.occuredError.subscribe(
      //   (error) => {
      //     console.log('occuredError1', error);
      //     this.alerts.push({
      //       type: 'danger',
      //       timeout: 5000,
      //       msg: error,
      //     });
      //     errorOccurred = true;
      //   }
      // );
      // this.subscriptions.push(errorSubcription);
    });

    if (onHiddenSubscription) {
      this.subscriptions.push(onHiddenSubscription);
    }
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

  // updateUser form
  hasErrorUsernameControl() {
    const control = this.displayNameControl;
    return control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessageUsernameControl() {
    const control = this.displayNameControl;
    if (control && control.errors) {
      let errorMessages: string[] = [];
      if (control.errors?.['required']) {
        errorMessages.push('The username field is required');
      }
      if (control.errors?.['minlength']) {
        errorMessages.push('Username should be at least 6 characters long');
      }
      if (control.errors?.['maxlength']) {
        errorMessages.push(
          'Username length should be less than or equal to 20'
        );
      }

      return errorMessages;
    }
    return [];
  }
  // updateUser form

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
