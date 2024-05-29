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
  private storage = inject(Storage);

  updateFileAndGetMetadata(
    mediaFolderPath: string,
    fileToUpload: File
  ): UploadTask {
    const { name } = fileToUpload;
    const filePath = `${mediaFolderPath}/${new Date().getTime()}_${name}`;
    const storageRef = ref(this.storage, filePath);

    return uploadBytesResumable(storageRef, fileToUpload);
  }

  updateFileAndGetDownloadURL(
    mediaFolderPath: string,
    fileToUpload: File
  ): Observable<string> {
    const { name } = fileToUpload;
    const filePath = `${mediaFolderPath}/${new Date().getTime()}_${name}`;
    const storageRef = ref(this.storage, filePath);

    const uploadTask: UploadTask = uploadBytesResumable(
      storageRef,
      fileToUpload
    );

    return new Observable<string>((observer) => {
      uploadTask
        .then((snapshot) => {
          getDownloadURL(snapshot.ref)
            .then((downloadURL) => {
              observer.next(downloadURL);
              observer.complete();
            })
            .catch((error) => {
              observer.error(error);
            });
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
