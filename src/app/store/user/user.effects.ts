// angular stuff
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import { FirebaseError } from 'firebase/app';

// interfaces
import {
  IStoreUserCredential,
  ProviderData,
} from '../../shared/models/user.model';

// services
import { AuthService } from '../../core/authentication/auth.service';

// actions
import * as UserActions from './user.actions';

// utils
import { minimalizeUserCredential } from '../../shared/utils/store.utils';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signUp),
      exhaustMap(({ data }) =>
        this.authService.signUp(data).pipe(
          mergeMap(async (userCredential) => {
            return UserActions.signUpSuccess({
              email: userCredential.user.email!,
              userCredential: await minimalizeUserCredential(userCredential),
            });
          }),
          catchError((error: FirebaseError) =>
            of(
              UserActions.signInManuallyFailure({
                errorMessage: error.code,
              })
            )
          )
        )
      )
    )
  );

  signInManually$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInManually),
      exhaustMap(({ email, password }) =>
        this.authService.signInManually(email, password).pipe(
          mergeMap(async (userCredential) => {
            return UserActions.signInManuallySuccess({
              email: userCredential.user.email!,
              userCredential: await minimalizeUserCredential(userCredential),
            });
          }),
          catchError((error: FirebaseError) =>
            of(
              UserActions.signInManuallyFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );
  signInWithFacebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInWithFacebook),
      exhaustMap(() =>
        this.authService.signInWithFacebook().pipe(
          mergeMap(async ({ data }) => {
            if (typeof data === 'string') {
              return UserActions.signInWithSocialsWrongProvider({
                email: data,
              });
            }
            return UserActions.signInWithFacebookSuccess({
              email: data.user.email!,
              userCredential: await minimalizeUserCredential(data),
            });
          }),
          catchError((error) =>
            of(
              UserActions.signInWithFacebookFailure({
                errorMessage: 'Error during signing up with Facebook!',
              })
            )
          )
        )
      )
    )
  );
  signInWithTwitter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInWithTwitter),
      exhaustMap(() =>
        this.authService.signInWithTwitter().pipe(
          mergeMap(async ({ data }) => {
            if (typeof data === 'string') {
              return UserActions.signInWithSocialsWrongProvider({
                email: data,
              });
            }
            return UserActions.signInWithTwitterSuccess({
              email: data.user.email!,
              userCredential: await minimalizeUserCredential(data),
            });
          }),
          catchError((error) =>
            of(
              UserActions.signInWithTwitterFailure({
                errorMessage: 'Error during signing up with Twitter!',
              })
            )
          )
        )
      )
    )
  );
  signInWithGoogle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInWithGoogle),
      exhaustMap(() =>
        this.authService.signInWithGoogle().pipe(
          mergeMap(async ({ data }) => {
            if (typeof data === 'string') {
              return UserActions.signInWithSocialsWrongProvider({
                email: data,
              });
            }
            return UserActions.signInWithTwitterSuccess({
              email: data.user.email!,
              userCredential: await minimalizeUserCredential(data),
            });
          }),
          catchError((error) =>
            of(
              UserActions.signInWithGoogleFailure({
                errorMessage: 'Error during signing up with Twitter!',
              })
            )
          )
        )
      )
    )
  );

  sendPasswordReset$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.sendPasswordReset),
        exhaustMap(({ email }) => this.authService.sendPasswordReset(email))
      ),
    { dispatch: false }
  );
  sendEmailVerification$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.sendEmailVerification),
        exhaustMap(() => this.authService.sendEmailVerification())
      ),
    { dispatch: false }
  );

  getUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.getUser),
      exhaustMap(() =>
        this.authService.getUser().pipe(
          mergeMap(async (user) => {
            const storeUserCredentials: IStoreUserCredential = {
              providerData: user?.providerData! as ProviderData[],
              tokenResult: await user?.getIdTokenResult()!,
            };
            return UserActions.getUserSuccess({
              email: user?.email!,
              userCredential: storeUserCredentials,
            });
          }),
          catchError((error: FirebaseError) =>
            of(
              UserActions.getUserFailure({
                errorMessage: error.code,
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
