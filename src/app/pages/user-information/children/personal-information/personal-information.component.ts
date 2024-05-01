import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';
import { Observable, switchMap, take, tap } from 'rxjs';
import { IUser } from '@app/shared/models/user.model';

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
export class PersonalInformationComponent implements OnInit, AfterViewInit {
  userInformationItem = userInformationContent[1];

  @ViewChild('changeImageEl') changeImageEl!: ElementRef<HTMLDivElement>;
  @ViewChild('changeImageInput')
  changeImageInput!: ElementRef<HTMLInputElement>;

  private store = inject(Store<UserState>);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  user$!: Observable<IUser | null>;
  userPhotoURL: string | null = null;
  displayName: string | null = null;

  areThereChanges: boolean = false;

  ngOnInit(): void {
    this.user$ = this.store.select(UserSelectors.selectUser);
    this.user$.subscribe((user) => {
      this.userPhotoURL = user?.userCredential?.providerData[0].photoURL;
      this.displayName = user?.userCredential?.providerData[0].displayName;
    });
  }

  ngAfterViewInit(): void {
    this.changeProfileImage();
  }

  changeProfileImage() {
    const changeEl = this.changeImageEl.nativeElement;
    const changeInput = this.changeImageInput.nativeElement;

    changeEl.addEventListener('click', () => {
      changeInput.click();
    });

    changeInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        console.log('uploaded file: ', file);
        this.userPhotoURL = URL.createObjectURL(file);
        this.areThereChanges = true;
      }
    });
  }

  // dorobić
  onSaveChanges() {
    const newUserPhoto = this.changeImageInput.nativeElement.files?.[0];
    if (newUserPhoto) {
      this.user$
        .pipe(
          take(1),
          switchMap((user) => {
            const mediaFolderPath = `${MEDIA_STORAGE_PATH}/profilePhotos/${user?.userCredential?.providerData[0].uid}/`;
            return this.storageService
              .updateFileAndGetDownloadURL(mediaFolderPath, newUserPhoto)
              .pipe(
                switchMap((url) => {
                  console.log('updateFileAndGetDownloadURL');
                  return this.authService.updateUserPromise({
                    photoURL: url,
                    displayName: this.displayName!,
                  });
                })
              );
          })
        )
        .subscribe(() => {
          this.store.dispatch(UserActions.getUser());
        });
    }
  }

  onCancel() {
    this.store.dispatch(UserActions.getUser());
  }
}
