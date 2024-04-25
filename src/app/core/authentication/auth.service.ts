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
  }> {
    return from(signInWithPopup(this.auth, new FacebookAuthProvider())).pipe(
      map((result: UserCredential) => {
        // const user = result.user;
        // const accessToken = credential?.accessToken;
        // const credential = FacebookAuthProvider.credentialFromResult(result);

        return { userCredential: result };
      })
    );
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
