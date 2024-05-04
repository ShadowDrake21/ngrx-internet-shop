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
  throwError,
} from 'rxjs';

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
        const updateData = {} as Partial<IUserUpdate>;
        updateData.displayName = signUpData.displayName;
        return this.updateUser(updateData).pipe(map(() => credential));
      })
    );
  }
  // !!!!!
  updateUser(updateData: Partial<IUserUpdate>): Observable<void> {
    if (Object.getOwnPropertyDescriptor(updateData, 'displayName')?.writable) {
      console.log('updateData Auth', updateData);
    }

    return from(
      updateProfile(this.auth.currentUser!, { displayName: 'example111' })
    ).pipe(
      catchError((err, caught) => {
        console.error(err);
        return throwError(err);
      })
    );
  }

  async updatePassword(password: string) {
    return await updatePassword(this.auth.currentUser!, password)
      .then(() => 'The password was successfully updated!')
      .catch((error: FirebaseError) => error.message);
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

  reauthenticateUser(email: string, password: string): Promise<UserCredential> {
    const credential = EmailAuthProvider.credential(email, password);
    return reauthenticateWithCredential(this.auth.currentUser!, credential);
  }

  getUser() {
    return of(this.auth.currentUser);
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}
