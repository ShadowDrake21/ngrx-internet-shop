// angular stuff
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  AuthCredential,
  createUserWithEmailAndPassword,
  EmailAuthCredential,
  EmailAuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  TwitterAuthProvider,
  updatePassword,
  updateProfile,
  UserCredential,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
import {
  catchError,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

import * as UserActions from '@store/user/user.actions';
import * as UserSelectors from '@store/user/user.selectors';

// interfaces
import { IUserSignUpData, IUserUpdate } from '../../shared/models/user.model';
import {
  child,
  Database,
  DataSnapshot,
  get,
  ref,
  set,
  update,
} from '@angular/fire/database';
import { SIGN_IN_PHOTO_URL } from '../constants/auth.constants';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private store = inject(Store<UserState>);
  private auth: Auth = inject(Auth);
  private database: Database = inject(Database);

  signUp(signUpData: IUserSignUpData): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(
        this.auth,
        signUpData.email,
        signUpData.password
      )
    ).pipe(
      switchMap((credential) => {
        const displayName = signUpData.displayName;
        return this.updateUser({
          displayName,
          photoURL: SIGN_IN_PHOTO_URL,
        }).pipe(
          tap(() => this.setProfileImage(SIGN_IN_PHOTO_URL)),
          map(() => credential)
        );
      })
    );
  }

  updateUser(updateData: Partial<IUserUpdate>): Observable<void> {
    return from(updateProfile(this.auth.currentUser!, updateData));
  }

  async updatePassword(password: string) {
    return await updatePassword(this.auth.currentUser!, password)
      .then(() => 'The password was successfully updated!')
      .catch((error: FirebaseError) => error.message);
  }

  setProfileImage(imageURL: string): Observable<void> {
    this.store.dispatch(UserActions.updateProfileImage({ imageURL }));
    return from(
      update(ref(this.database, 'users/' + this.auth.currentUser?.uid), {
        profileImage: imageURL,
      })
    );
  }

  getProfileImage(): Observable<string> {
    return from(
      get(child(ref(this.database), 'users/' + this.auth.currentUser?.uid))
    ).pipe(
      map((snaphot: DataSnapshot) => {
        if (snaphot.exists()) {
          const result = snaphot.val() as {
            displayName: string;
            profileImage: string;
          };
          return result.profileImage;
        } else {
          return '';
        }
      })
    );
  }

  signInManually(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  signInWithFacebook(): Observable<{ data: string | UserCredential }> {
    return from(signInWithPopup(this.auth, new FacebookAuthProvider())).pipe(
      map((userCredential) => ({ data: userCredential })),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of({ data: email });
      })
    );
  }

  signInWithTwitter(): Observable<{ data: string | UserCredential }> {
    return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
      map((userCredential) => ({ data: userCredential })),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of({ data: email });
      })
    );
  }

  signInWithGoogle(): Observable<{ data: string | UserCredential }> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map((userCredential) => ({ data: userCredential })),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of({ data: email });
      })
    );
  }

  signInWithAnotherMethods(email: string): Observable<string[]> {
    return from(fetchSignInMethodsForEmail(this.auth, email));
  }

  sendEmailVerification() {
    console.log(this.auth.currentUser);
    return from(sendEmailVerification(this.auth.currentUser!));
  }

  reauthenticateUser(
    email: string,
    password: string
  ): Observable<UserCredential> {
    const credential = EmailAuthProvider.credential(email, password);
    return from(
      reauthenticateWithCredential(this.auth.currentUser!, credential)
    );
  }

  reauthenticateUserObservable(
    email: string,
    password: string
  ): Observable<UserCredential> {
    const credential = EmailAuthProvider.credential(email, password);
    return from(
      reauthenticateWithCredential(this.auth.currentUser!, credential)
    ).pipe(
      map((credential) => credential),
      catchError((error: FirebaseError) => throwError(() => error))
    );
  }

  getUser() {
    return of(this.auth.currentUser);
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
