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

  signInWithFacebook(): Observable<{
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

  // signInWithTwitter(): Observable<{
  //   userCredential: UserCredential;
  // }> {
  //   return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
  //     map((resut: UserCredential) => {
  //       return { userCredential: resut };
  //     })
  //   );
  // }

  signInWithFB(): Observable<{ data: string | UserCredential }> {
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
      map((userCredential) => ({ data: userCredential })),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of({ data: email });
      })
    );

    // return email;
  }

  signInWithTwitter(): Observable<{ data: string | UserCredential }> {
    return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
      map((userCredential) => ({ data: userCredential })),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of({ data: email });
      })
    );

    // return email;
  }

  signInWithGoogle(): Observable<{ data: string | UserCredential }> {
    return from(signInWithPopup(this.auth, new GoogleAuthProvider())).pipe(
      map((userCredential) => ({ data: userCredential })),
      catchError((error: FirebaseError) => {
        const email = (error.customData?.['email'] as string) || 'unknown';
        return of({ data: email });
      })
    );

    // return email;
  }

  signInWithAnotherMethods(email: string): Observable<string[]> {
    return from(fetchSignInMethodsForEmail(this.auth, email));
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
