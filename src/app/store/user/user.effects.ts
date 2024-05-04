// angular stuff
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  EMPTY,
  exhaustMap,
  map,
  mergeMap,
  of,
  switchMap,
  take,
} from 'rxjs';
import { FirebaseError } from 'firebase/app';

// interfaces
import {
  IStoreUserCredential,
  IUserUpdate,
  ProviderData,
} from '../../shared/models/user.model';

// services
import { AuthService } from '../../core/authentication/auth.service';

// actions
import * as UserActions from './user.actions';
import * as UserSelectors from './user.selectors';

// utils
import { minimalizeUserCredential } from '../../shared/utils/store.utils';
import { Store } from '@ngrx/store';
import { UserState } from './user.reducer';
import { MEDIA_STORAGE_PATH } from '@app/core/constants/storage.constants';
import { StorageService } from '@app/core/services/storage.service';
import { createAuthInLS } from '@app/core/utils/auth.utils';

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
            const providerData: ProviderData = {
              providerId: user?.providerData[0].providerId!,
              uid: user?.providerData[0].uid!,
              displayName: user?.providerData[0].displayName!,
              email: user?.providerData[0].email!,
              phoneNumber: user?.providerData[0].phoneNumber!,
              photoURL: user?.providerData[0].photoURL!,
            };
            const storeUserCredentials: IStoreUserCredential = {
              providerData: [providerData],
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

  reauthenticateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.reauthenticateUser),
      exhaustMap(({ email, password }) =>
        this.authService.reauthenticateUserObservable(email, password).pipe(
          mergeMap(async (userCredential) => {
            return UserActions.reauthenticateUserSuccess({
              email: userCredential.user.email!,
              userCredential: await minimalizeUserCredential(userCredential),
            });
          }),
          catchError((error: FirebaseError) =>
            of(
              UserActions.reauthenticateUserFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );

  updateDisplayName$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateDisplayName),
      exhaustMap(({ displayName }) =>
        this.authService.getUser().pipe(
          mergeMap(async (user) => {
            const providerData: ProviderData = {
              providerId: user?.providerData[0].providerId!,
              uid: user?.providerData[0].uid!,
              displayName: displayName,
              email: user?.providerData[0].email!,
              phoneNumber: user?.providerData[0].phoneNumber!,
              photoURL: user?.providerData[0].photoURL!,
            };
            const storeUserCredentials: IStoreUserCredential = {
              providerData: [providerData],
              tokenResult: await user?.getIdTokenResult()!,
            };
            return UserActions.updateDisplayNameSuccess({
              email: user?.email!,
              userCredential: storeUserCredentials,
            });
          }),
          catchError((error: FirebaseError) =>
            of(
              UserActions.updateDisplayNameFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );
  updateProfileImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateProfileImage),
      exhaustMap(({ imageURL }) =>
        this.authService.getUser().pipe(
          mergeMap(async (user) => {
            const providerData: ProviderData = {
              providerId: user?.providerData[0].providerId!,
              uid: user?.providerData[0].uid!,
              displayName: user?.providerData[0].displayName!,
              email: user?.providerData[0].email!,
              phoneNumber: user?.providerData[0].phoneNumber!,
              photoURL: imageURL,
            };
            const storeUserCredentials: IStoreUserCredential = {
              providerData: [providerData],
              tokenResult: await user?.getIdTokenResult()!,
            };
            createAuthInLS(storeUserCredentials);
            return UserActions.updateProfileImageSuccess({
              email: user?.email!,
              userCredential: storeUserCredentials,
            });
          }),
          catchError((error: FirebaseError) =>
            of(
              UserActions.updateProfileImageFailure({
                errorMessage: error.message,
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
