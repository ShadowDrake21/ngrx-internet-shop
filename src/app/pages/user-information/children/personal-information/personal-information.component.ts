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
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { createAuthInLS } from '@app/core/utils/auth.utils';
import { minimalizeUserCredential } from '@app/shared/utils/store.utils';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    NgOptimizedImage,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
})
export class PersonalInformationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  userInformationItem = userInformationContent[1];

  @ViewChild('displayName')
  displayName!: ElementRef<HTMLInputElement>;
  @ViewChild('changeImageEl') changeImageEl!: ElementRef<HTMLDivElement>;
  @ViewChild('changeImageInput')
  changeImageInput!: ElementRef<HTMLInputElement>;

  private store = inject(Store<UserState>);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  user$!: Observable<IUser | null>;

  isProfileChanged: boolean = false;

  updatedUserPhotoFile: File | null = null;
  userPhotoURL: string | null = null;

  previousDisplayName: string | null = null;
  newDisplayName: string | null = null;

  controlButtonsActive: boolean = false;
  saveButtonActive: boolean = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.user$ = this.store.select(UserSelectors.selectUser);
    const userSubscription = this.user$.subscribe((user) => {
      this.userPhotoURL = user?.userCredential?.providerData[0].photoURL;

      this.previousDisplayName =
        user?.userCredential?.providerData[0].displayName;
      this.newDisplayName = this.previousDisplayName;
    });

    const changedSubscription = this.store
      .select(UserSelectors.selectChanged)
      .subscribe((value) => {
        this.isProfileChanged = value;
      });

    this.subscriptions.push(userSubscription, changedSubscription);
  }

  ngAfterViewInit(): void {
    this.changeProfile();
  }

  changeProfile() {
    const displayNameInput = this.displayName.nativeElement;
    const changeEl = this.changeImageEl.nativeElement;
    const changeInput = this.changeImageInput.nativeElement;

    displayNameInput.addEventListener('input', () => {
      if (!this.isProfileChanged) {
        console.log(this.newDisplayName, this.previousDisplayName);
        if (!this.controlButtonsActive) {
          this.controlButtonsActive = true;
        }
        this.updateSaveButtonState();
      }
    });

    changeEl.addEventListener('click', () => {
      if (!this.isProfileChanged) {
        changeInput.click();
      }
    });

    changeInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        this.updatedUserPhotoFile = file;
        this.userPhotoURL = URL.createObjectURL(file);
      }

      if (!this.controlButtonsActive) {
        this.controlButtonsActive = true;
      }
      this.updateSaveButtonState();
    });
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
          this.controlButtonsActive = false;
          this.store.dispatch(UserActions.getUser());
          this.store.dispatch(UserActions.setChangeFlag());
          this.updateLocalStorageData();
        },
        error: (error) => {
          console.log(error);
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
    this.controlButtonsActive = false;
    this.store.dispatch(UserActions.getUser());
  }

  resetSubscriptions(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
