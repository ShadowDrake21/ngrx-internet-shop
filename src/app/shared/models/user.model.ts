import { IdTokenResult } from 'firebase/auth';

export interface IStoreUserCredential {
  tokenResult: IdTokenResult;
  providerData: ProviderData[];
}

export interface StsTokenManager {
  refreshToken: string;
  accessToken: string;
  expirationTime: number;
}

export interface ProviderData {
  providerId: string;
  uid: string;
  displayName: any;
  email: string;
  phoneNumber: any;
  photoURL: any;
}
