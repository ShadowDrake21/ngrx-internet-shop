import { IdTokenResult } from 'firebase/auth';

export interface IUser {
  userCredential: IStoreUserCredential | null;
  online: boolean;
}
export interface IStoreUserCredential {
  tokenResult: IdTokenResult;
  providerData: ProviderData[];
}

export interface ProviderData {
  providerId: string;
  uid: string;
  displayName: any;
  email: string;
  phoneNumber: any;
  photoURL: any;
}
