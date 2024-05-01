import { inject, Injectable } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class RealtimeDatabaseService {
  private database: Database = inject(Database);

  async saveUserImage(userId: string, imageURL: string) {
    const userImagePath = `users/${userId}/profile_picture`;

    const userImageRef = ref(this.database, userImagePath);
    return await set(userImageRef, imageURL).then(() => userImagePath);
  }
}
