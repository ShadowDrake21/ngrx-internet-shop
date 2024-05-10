import { inject, Injectable } from '@angular/core';
import { Database } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db = inject(Database);
}
