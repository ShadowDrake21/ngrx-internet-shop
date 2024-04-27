// angular stuff
import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  TwitterAuthProvider,
  updateProfile,
  UserCredential,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';

// interfaces
import { IUserSignUpData, IUserUpdate } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);

  signUp(signUpData: IUserSignUpData): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(
        this.auth,
        signUpData.email,
        signUpData.password
      )
    ).pipe(
      switchMap((credential) => {
        return this.updateUser({ displayName: signUpData.username }).pipe(
          map(() => credential)
        );
      })
    );
  }

  updateUser(updateData: IUserUpdate) {
    return from(updateProfile(this.auth.currentUser!, updateData));
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
    return from(sendEmailVerification(this.auth.currentUser!));
  }

  getUser() {
    return of(this.auth.currentUser);
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
