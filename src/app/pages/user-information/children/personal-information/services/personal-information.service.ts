import { inject, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from '@app/core/authentication/auth.service';
import { MEDIA_STORAGE_PATH } from '@app/core/constants/storage.constants';
import { StorageService } from '@app/core/services/storage.service';
import { IStoreUserCredential, IUser } from '@app/shared/models/user.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PersonalInformationService {
  private readonly storageService = inject(StorageService);

  private readonly passwordErrorMessages = {
    required: 'The password field is required',
    minlength: 'A password should be at least 6 characters long',
    maxlength: 'A password length should be less than or equal to 20',
  };

  getErrorMessageChangePasswordForm(control: FormControl<any>) {
    if (!control || !control.errors) return [];

    return Object.keys(control.errors)
      .filter(
        (key) =>
          this.passwordErrorMessages[
            key as keyof typeof this.passwordErrorMessages
          ]
      )
      .map(
        (key) =>
          this.passwordErrorMessages[
            key as keyof typeof this.passwordErrorMessages
          ]
      );
  }

  getExpirationTimeFromStorage(): string {
    const userCredentialStr = localStorage.getItem('ngrx-user-credential');
    if (!userCredentialStr) return '';

    try {
      const userCredential = JSON.parse(userCredentialStr);
      return userCredential.tokenResult.expirationTime || '';
    } catch {
      return '';
    }
  }

  updateProfileImage(
    user: IUser | null,
    file: File | null
  ): Observable<string | null> {
    if (!file || !user?.userCredential?.providerData[0].uid) {
      return of(null);
    }

    const mediaFolderPath = `${MEDIA_STORAGE_PATH}/profilePhotos/${user?.userCredential?.providerData[0].uid}`;

    return this.storageService.updateFileAndGetDownloadURL(
      mediaFolderPath,
      file
    );
  }

  prepareUpdatedCredentials(user: IUser | null): IStoreUserCredential | null {
    if (!user?.userCredential) return null;

    return {
      ...user?.userCredential,
      tokenResult: {
        ...user?.userCredential.tokenResult,
        expirationTime: this.getExpirationTimeFromStorage(),
      },
    };
  }

  isManualSignIn(user: IUser | null): boolean {
    return user?.userCredential?.tokenResult.signInProvider === 'password';
  }

  getUserPhotoUrl(user: IUser | null): string | null {
    return user?.userCredential?.providerData[0].photoURL || null;
  }
}
