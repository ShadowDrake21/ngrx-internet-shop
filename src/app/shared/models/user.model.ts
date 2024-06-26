import { IdTokenResult } from 'firebase/auth';

export interface IUserSignUpData {
  displayName: string;
  email: string;
  password: string;
}

export interface IUserUpdate {
  displayName: string;
  photoURL: string;
}

export interface IUser {
  userCredential: IStoreUserCredential | null;
  online: boolean;
}
export interface IStoreUserCredential {
  emailVerified: boolean;
  tokenResult: IdTokenResult;
  providerData: ProviderData[];
}

export interface ProviderData {
  providerId: string;
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
}
