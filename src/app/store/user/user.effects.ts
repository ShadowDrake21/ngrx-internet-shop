// angular stuff
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  exhaustMap,
  filter,
  firstValueFrom,
  from,
  map,
  mergeMap,
  Observable,
  of,
  take,
  tap,
} from 'rxjs';
import { FirebaseError } from 'firebase/app';

import {
  IStoreUserCredential,
  ProviderData,
} from '../../shared/models/user.model';

// services
import { AuthService } from '../../core/authentication/auth.service';

// actions
import * as UserActions from './user.actions';
import * as FavoritesActions from '@store/favorites/favorites.action';
import * as PurchaseActions from '@store/purchase/purchase.actions';
// utils
import { minimalizeUserCredential } from '../../shared/utils/store.utils';
import { createAuthInLS } from '@app/core/utils/auth.utils';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

@Injectable()
export class UserEffects {
  private store = inject(Store<AppState>);
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
            const photoURL = await this.retrievePhotoURL();

            const minimalizedUserCredential = await minimalizeUserCredential(
              userCredential
            );
            const updatedUserCredential: IStoreUserCredential = {
              ...minimalizedUserCredential,
              providerData: [
                {
                  ...minimalizedUserCredential.providerData[0],
                  photoURL,
                },
              ],
            };

            return [
              UserActions.signInManuallySuccess({
                email: userCredential.user.email!,
                userCredential: updatedUserCredential,
              }),
              FavoritesActions.loadAllFavorites(),
            ];
          }),
          mergeMap((actions) => from(actions)),
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
          mergeMap((action) =>
            action.type === UserActions.signInWithFacebookSuccess.type
              ? of(action, FavoritesActions.loadAllFavorites())
              : of(action)
          ),
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
          mergeMap((action) =>
            action.type === UserActions.signInWithTwitterSuccess.type
              ? of(action, FavoritesActions.loadAllFavorites())
              : of(action)
          ),
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
            return UserActions.signInWithGoogleSuccess({
              email: data.user.email!,
              userCredential: await minimalizeUserCredential(data),
            });
          }),
          mergeMap((action) =>
            action.type === UserActions.signInWithGoogleSuccess.type
              ? of(action, FavoritesActions.loadAllFavorites())
              : of(action)
          ),
          catchError((error) =>
            of(
              UserActions.signInWithGoogleFailure({
                errorMessage: 'Error during signing up with Google!',
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
            const storeUserCredentails: IStoreUserCredential = {
              providerData: [providerData],
              emailVerified: user?.emailVerified!,
              tokenResult: await user?.getIdTokenResult()!,
            };

            const photoURL = await this.retrievePhotoURL();

            const updatedUserCredential: IStoreUserCredential = {
              ...storeUserCredentails,
              providerData: [
                {
                  ...storeUserCredentails.providerData[0],
                  photoURL,
                },
              ],
            };

            return UserActions.getUserSuccess({
              email: user?.email!,

              userCredential: updatedUserCredential,
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
            const photoURL = await this.retrievePhotoURL();

            const minimalizedUserCredential = await minimalizeUserCredential(
              userCredential
            );
            const updatedUserCredential: IStoreUserCredential = {
              ...minimalizedUserCredential,
              providerData: [
                {
                  ...minimalizedUserCredential.providerData[0],
                  photoURL,
                },
              ],
            };

            return UserActions.reauthenticateUserSuccess({
              email: userCredential.user.email!,
              userCredential: updatedUserCredential,
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
              emailVerified: user?.emailVerified!,
              tokenResult: await user?.getIdTokenResult()!,
            };
            const photoURL = await this.retrievePhotoURL();

            const updatedUserCredential: IStoreUserCredential = {
              ...storeUserCredentials,
              providerData: [
                {
                  ...storeUserCredentials.providerData[0],
                  photoURL,
                },
              ],
            };

            createAuthInLS(storeUserCredentials);
            return UserActions.updateProfileImageSuccess({
              email: updatedUserCredential.providerData[0].email,
              userCredential: updatedUserCredential,
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
        this.authService.signOut().pipe(
          tap(() => sessionStorage.removeItem('transactions')),
          tap(() => this.store.dispatch(PurchaseActions.clearPurchaseState())),
          tap(() =>
            this.store.dispatch(FavoritesActions.clearFavoritesState())
          ),
          map(() => UserActions.signOutSuccess())
        )
      )
    )
  );

  async retrievePhotoURL(): Promise<string> {
    const photoURL$: Observable<string> = this.authService.getProfileImage();
    return await firstValueFrom(photoURL$.pipe(take(1)));
  }
}
