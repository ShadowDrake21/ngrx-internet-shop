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
  switchMap,
  take,
  tap,
} from 'rxjs';
import { FirebaseError } from 'firebase/app';
import { Store } from '@ngrx/store';

// interfaces
import { IStoreUserCredential, ProviderData } from '@models/user.model';

// services
import { AuthService } from '@core/authentication/auth.service';
import { CheckoutService } from '@core/services/checkout.service';

// actions
import { AppState } from '../app.state';
import * as UserActions from './user.actions';
import * as FavoritesActions from '@store/favorites/favorites.actions';
import * as CartActions from '@store/cart/cart.actions';
import * as PurchaseActions from '@store/purchase/purchase.actions';

// utils
import { minimalizeUserCredential } from '@shared/utils/store.utils';
import { createAuthInLS } from '@core/utils/auth.utils';

@Injectable()
export class UserEffects {
  private store = inject(Store<AppState>);
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private checkoutService = inject(CheckoutService);

  signUp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.signUp),
      exhaustMap(({ data }) =>
        this.authService.signUp(data).pipe(
          switchMap((userCredential) =>
            from(minimalizeUserCredential(userCredential)).pipe(
              mergeMap((minimalizedUserCredential) => [
                PurchaseActions.createCustomer({
                  email: minimalizedUserCredential.providerData[0].email,
                }),
                UserActions.signUpSuccess({
                  email: minimalizedUserCredential.providerData[0].email,
                  userCredential: minimalizedUserCredential,
                }),
              ])
            )
          ),
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
              PurchaseActions.getCustomer({
                email: userCredential.user.email!,
              }),
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
              ? of(
                  action,
                  PurchaseActions.getCustomer({
                    email: action.email,
                  }),
                  FavoritesActions.loadAllFavorites()
                )
              : of(action)
          ),
          catchError((error: FirebaseError) =>
            of(
              UserActions.signInWithFacebookFailure({
                errorMessage: error.message,
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
              ? of(
                  action,
                  PurchaseActions.getCustomer({
                    email: action.email,
                  }),
                  FavoritesActions.loadAllFavorites()
                )
              : of(action)
          ),
          catchError((error: FirebaseError) =>
            of(
              UserActions.signInWithTwitterFailure({
                errorMessage: error.message,
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
              ? of(
                  action,
                  PurchaseActions.getCustomer({
                    email: action.email,
                  }),
                  FavoritesActions.loadAllFavorites()
                )
              : of(action)
          ),
          catchError((error: FirebaseError) =>
            of(
              UserActions.signInWithGoogleFailure({
                errorMessage: error.message,
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
                // errorMessage: error.code,
                errorMessage: error.message,
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
          tap(() => {
            sessionStorage.removeItem('customer');
            sessionStorage.removeItem('transactions');
          }),
          tap(() => {
            return [
              this.store.dispatch(PurchaseActions.clearPurchaseState()),
              this.store.dispatch(FavoritesActions.clearFavoritesState()),
              this.store.dispatch(CartActions.clearCartState()),
            ];
          }),
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
