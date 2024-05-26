import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authentication/auth.service';
import { inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const store = inject(Store<UserState>);

  return store.select(UserSelectors.selectUser).pipe(
    switchMap((user) => {
      if (user?.online) {
        return of(true);
      }
      router.navigate(['/home']);
      return of(false);
    })
  );
};
