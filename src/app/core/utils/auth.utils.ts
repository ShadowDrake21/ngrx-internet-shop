import { IStoreUserCredential } from '../../shared/models/user.model';

export const createAuthInLS = (userCredential: IStoreUserCredential) => {
  localStorage.setItem('ngrx-user-credential', JSON.stringify(userCredential));
};
