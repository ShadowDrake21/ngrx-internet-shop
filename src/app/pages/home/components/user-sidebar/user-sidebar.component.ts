import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { UserState } from '@app/store/user/user.reducer';
import { Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import * as UserSelectors from '@store/user/user.selectors';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { AppState } from '@app/store/app.state';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, TruncateTextPipe, RouterLink],
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.scss',
})
export class UserSidebarComponent implements OnInit {
  private store = inject(Store<AppState>);

  onlineStatus: boolean = false;
  user$!: Observable<IUser | null>;
  favorites$!: Observable<number[]>;

  ngOnInit(): void {
    this.user$ = this.store
      .select(UserSelectors.selectUser)
      .pipe(tap((user) => (this.onlineStatus = user?.online!)));

    this.user$.subscribe();
    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);
  }
}
