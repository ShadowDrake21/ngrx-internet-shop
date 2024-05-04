// angular stuff
import { UserCredential } from 'firebase/auth';

// interfaces
import {
  IStoreUserCredential,
  IUserBasic,
  ProviderData,
} from '../models/user.model';

export const minimalizeUserCredential = async (
  userCredential: UserCredential
): Promise<IStoreUserCredential> => {
  let tokenResult = await userCredential.user.getIdTokenResult();

  return {
    tokenResult: tokenResult!,
    providerData: userCredential.user.providerData as ProviderData[],
  };
};
