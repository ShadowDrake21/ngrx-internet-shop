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

  // signInViaTwitter(): Observable<{
  //   userCredential: UserCredential;
  // }> {
  //   return from(signInWithPopup(this.auth, new TwitterAuthProvider())).pipe(
  //     map((resut: UserCredential) => {
  //       return { userCredential: resut };
  //     })
  //   );
  // }

  async signInViaFB() {
    // signInWithPopup(this.auth, new FacebookAuthProvider()).catch(
    //   (err: FirebaseError) => {
    //     console.log(err.customData);
    //   }
    // );
    let email = '';
    await signInWithPopup(this.auth, new FacebookAuthProvider()).catch(
      (err: FirebaseError) => {
        email = (err.customData?.['email'] as string) ?? 'unknown';
        console.log(email);
      }
    );

    return email;
  }

  signInViaTwitter() {
    signInWithPopup(this.auth, new TwitterAuthProvider()).catch(
      (err: FirebaseError) => {
        console.log(err.customData);
      }
    );
  }

  signInViaGoogle() {
    signInWithPopup(this.auth, new GoogleAuthProvider()).catch(
      (err: FirebaseError) => {
        console.log(err.code);
      }
    );
  }

  signInWithAnotherMethods(email: string) {
    fetchSignInMethodsForEmail(this.auth, email).catch((err: FirebaseError) => {
      console.log(err);
    });
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
