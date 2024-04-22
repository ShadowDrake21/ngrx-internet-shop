import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/authentication/auth.service';
import * as UserActions from './user.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  signInManually$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInManually),
      exhaustMap(({ email, password }) =>
        this.authService.signInManually(email, password).pipe(
          map((userCredential) =>
            UserActions.signInManuallySuccess({ userCredential })
          ),
          catchError((error) =>
            of(
              UserActions.signInManuallyFailure({
                errorMessage: 'Error during a signing up!',
              })
            )
          )
        )
      )
    )
  );
}
