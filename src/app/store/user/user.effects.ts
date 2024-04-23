import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/authentication/auth.service';
import * as UserActions from './user.actions';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import {
  IStoreUserCredential,
  ProviderData,
} from '../../shared/models/user.model';
import { IdTokenResult } from 'firebase/auth';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  signInManually$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInManually),
      exhaustMap(({ email, password }) =>
        this.authService.signInManually(email, password).pipe(
          mergeMap(async (userCredential) => {
            let tokenResult = await userCredential.user.getIdTokenResult();

            const minimalizeUserCredential: IStoreUserCredential = {
              tokenResult: tokenResult!,
              providerData: userCredential.user.providerData as ProviderData[],
            };
            return UserActions.signInManuallySuccess({
              userCredential: minimalizeUserCredential,
            });
          }),
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
  signOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signOut),
      exhaustMap(() =>
        this.authService.signOut().pipe(map(() => UserActions.signOutSuccess()))
      )
    )
  );
}
