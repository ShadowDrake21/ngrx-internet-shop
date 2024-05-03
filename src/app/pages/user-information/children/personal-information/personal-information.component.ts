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
  ],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
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

  private store = inject(Store<UserState>);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private fb = inject(FormBuilder);

  user$!: Observable<IUser | null>;

  isChangeMode: boolean = false;

  updatedUserPhotoFile: File | null = null;
  userPhotoURL: string | null = null;

  private displayNamePattern: RegExp =
    /^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
  previousDisplayName: string | null = null;
  newDisplayName: string | null = null;

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
      this.userPhotoURL = user?.userCredential?.providerData[0].photoURL;

      this.previousDisplayName =
        user?.userCredential?.providerData[0].displayName;
      this.newDisplayName = this.previousDisplayName;
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

      this.validateDisplayName(displayNameInput.value);
      this.updateSaveButtonState();
    });

    changeEl.addEventListener('click', () => {
      changeInput.click();
    });

    changeInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        this.updatedUserPhotoFile = file;
        this.userPhotoURL = URL.createObjectURL(file);
      }

      this.updateSaveButtonState();
    });
  }

  validateDisplayName(testedValue: string) {
    if (this.displayNamePattern.test(testedValue)) {
      if (this.displayName.nativeElement.classList.contains('error')) {
        this.displayName.nativeElement.classList.remove('error');
      }
    } else {
      this.displayName.nativeElement.classList.add('error');
    }
  }

  private updateSaveButtonState() {
    if (
      !this.updatedUserPhotoFile &&
      this.newDisplayName === this.previousDisplayName
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
            return this.storageService.updateFileAndGetDownloadURL(
              mediaFolderPath,
              this.updatedUserPhotoFile!
            );
          } else {
            return of(null);
          }
        }),
        switchMap((url) => {
          let updateData = {} as Partial<IUserUpdate>;

          if (this.updatedUserPhotoFile) {
            updateData.photoURL = url!;
          }
          if (this.newDisplayName !== this.previousDisplayName) {
            updateData.displayName = this.newDisplayName!;
          }

          return this.authService.updateUser(updateData);
        })
      )
      .subscribe({
        next: () => {
          this.onToggleChangeMode();
          this.previousDisplayName = this.newDisplayName;
          this.updateLocalStorageData();
        },
        error: (error) => {
          this.onToggleChangeMode();
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
      this.previousDisplayName !== this.newDisplayName
    ) {
      this.store.dispatch(UserActions.getUser());
    }
  }

  buttonCancelEffects() {
    this.isChangeMode = !this.isChangeMode;
    this.controlButtonsActive = false;
  }

  onSaveNewPassword() {
    this.authService.updatePassword(this.newPassword).subscribe((result) => {
      this.alerts.push({ type: 'success', timeout: 5000, msg: result });
    });
  }

  // password form
  get passwordControl() {
    return this.changePasswordForm.get('password') as FormControl;
  }

  hasError() {
    const control = this.passwordControl;
    return control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage() {
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
  // password form
  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
