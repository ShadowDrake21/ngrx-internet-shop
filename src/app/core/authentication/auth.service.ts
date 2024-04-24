import { inject, Injectable } from '@angular/core';
import {
  Auth,
  FacebookAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
import { catchError, from, map, Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth = inject(Auth);

  signInManually(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  sendPasswordReset(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  signInViaFacebook(): Observable<{
    userCredential: UserCredential;
    accessToken: string | undefined;
  }> {
    return from(signInWithPopup(this.auth, new FacebookAuthProvider())).pipe(
      map((result: UserCredential) => {
        const user = result.user;
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;

        return { userCredential: result, accessToken };
      }),
      catchError((error: FirebaseError) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const credential = FacebookAuthProvider.credentialFromError(error);

        console.log('Firebase Authentication Credential:', credential);

        return throwError(error);
      })
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
