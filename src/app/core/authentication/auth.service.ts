import { inject, Injectable } from '@angular/core';
import {
  Auth,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  TwitterAuthProvider,
  UserCredential,
} from '@angular/fire/auth';
import { FirebaseError } from 'firebase/app';
import { catchError, from, map, Observable, of, throwError } from 'rxjs';

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

  // signInViaTwitter(): Observable<{
  //   userCredential: UserCredential;
  // }> {
  //   return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
  //     map((resut: UserCredential) => {
  //       return { userCredential: resut };
  //     })
  //   );
  // }

  signInViaFB(): Observable<string | UserCredential> {
    // signInWithPopup(this.auth, new FacebookAuthProvider()).catch(
    //   (err: FirebaseError) => {
    //     console.log(err.customData);
    //   }
    // );
    // await signInWithPopup(this.auth, new FacebookAuthProvider()).catch(
    //   (err: FirebaseError) => {
    //     email = (err.customData?.['email'] as string) ?? 'unknown';
    //   }
    // );

    return from(signInWithPopup(this.auth, new FacebookAuthProvider())).pipe(
      map((userCredential) => userCredential),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of(email);
      })
    );

    // return email;
  }

  signInViaTwitter(): Observable<string | UserCredential> {
    return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
      map((userCredential) => userCredential),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of(email);
      })
    );
  }

  signInViaGoogle(): Observable<string | UserCredential> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map((userCredential) => userCredential),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of(email);
      })
    );
  }

  signInWithAnotherMethods(email: string): Promise<string[]> {
    return fetchSignInMethodsForEmail(this.auth, email);
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
