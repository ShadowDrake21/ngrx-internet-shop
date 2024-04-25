import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../core/authentication/auth.service';
import * as UserActions from './user.actions';
import { catchError, exhaustMap, map, mergeMap, of } from 'rxjs';
import {
  IStoreUserCredential,
  ProviderData,
} from '../../shared/models/user.model';
import { IdTokenResult, UserCredential } from 'firebase/auth';

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
            console.log(userCredential);
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
  signInWithFacebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signInWithFacebook),
      exhaustMap(() =>
        this.authService.signInWithFB().pipe(
          mergeMap(async ({ data }) => {
            if (typeof data === 'string') {
              return UserActions.signInWithSocialsWrongProvider({
                email: data,
              });
            }
            const userCredential = data as UserCredential;
            let tokenResult = await userCredential.user.getIdTokenResult();

            const minimalizeUserCredential: IStoreUserCredential = {
              tokenResult: tokenResult!,
              providerData: userCredential.user.providerData as ProviderData[],
            };
            return UserActions.signInWithFacebookSuccess({
              email: userCredential.user.email!,
              userCredential: minimalizeUserCredential,
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
            const userCredential = data as UserCredential;
            let tokenResult = await userCredential.user.getIdTokenResult();

            const minimalizeUserCredential: IStoreUserCredential = {
              tokenResult: tokenResult!,
              providerData: userCredential.user.providerData as ProviderData[],
            };
            return UserActions.signInWithTwitterSuccess({
              email: userCredential.user.email!,
              userCredential: minimalizeUserCredential,
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
            const userCredential = data as UserCredential;
            let tokenResult = await userCredential.user.getIdTokenResult();

            const minimalizeUserCredential: IStoreUserCredential = {
              tokenResult: tokenResult!,
              providerData: userCredential.user.providerData as ProviderData[],
            };
            return UserActions.signInWithGoogleSuccess({
              email: userCredential.user.email!,
              userCredential: minimalizeUserCredential,
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
  // signInWithTwitter$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(UserActions.signInWithTwitter),
  //     exhaustMap(() =>
  //       this.authService.signInWithTwitter().pipe(
  //         mergeMap(async ({ userCredential }) => {
  //           let tokenResult = await userCredential.user.getIdTokenResult();

  //           const minimalizeUserCredential: IStoreUserCredential = {
  //             tokenResult: tokenResult!,
  //             providerData: userCredential.user.providerData as ProviderData[],
  //           };
  //           return UserActions.signInWithFacebookSuccess({
  //             userCredential: minimalizeUserCredential,
  //           });
  //         }),
  //         catchError((error) =>
  //           of(
  //             UserActions.signInWithFacebookFailure({
  //               errorMessage: 'Error during signing up with Twitter!',
  //             })
  //           )
  //         )
  //       )
  //     )
  //   )
  // );
  sendPasswordReset$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.sendPasswordReset),
        exhaustMap(({ email }) => this.authService.sendPasswordReset(email))
      ),
    { dispatch: false }
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
