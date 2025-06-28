// angular stuff
import { inject, Injectable } from '@angular/core';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
  UploadTask,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface FilesUploadMetadata {
  uploadProgress$: Observable<number | undefined>;
  downloadUrl$: Observable<string>;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(Storage);

  updateFileAndGetMetadata(
    mediaFolderPath: string,
    fileToUpload: File
  ): UploadTask {
    const filePath = this.generateFilePath(mediaFolderPath, fileToUpload);
    const storageRef = ref(this.storage, filePath);
    return uploadBytesResumable(storageRef, fileToUpload);
  }

  updateFileAndGetDownloadURL(
    mediaFolderPath: string,
    fileToUpload: File
  ): Observable<string> {
    const filePath = this.generateFilePath(mediaFolderPath, fileToUpload);
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    return new Observable<string>((subscriber) => {
      const onComplete = async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          subscriber.next(downloadUrl);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      };

      const onError = (error: any) => {
        subscriber.error(error);
      };

      const unsubscribe = uploadTask.on(
        'state_changed',
        null,
        onError,
        onComplete
      );

      return () => {
        unsubscribe();

        try {
          uploadTask.cancel();
        } catch (e) {
          console.warn('Error cancelling upload task:', e);
        }
      };
    });
  }

  private generateFilePath(folderPath: string, file: File): string {
    return `${folderPath}/${Date.now()}_${file.name}`;
  }
}
