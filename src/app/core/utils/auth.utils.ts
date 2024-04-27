// interfaces
import { IStoreUserCredential } from '../../shared/models/user.model';

// contants
import { LS_AUTH_ITEM_NAME } from '../constants/auth.constants';

export const createAuthInLS = (userCredential: IStoreUserCredential) => {
  localStorage.setItem(LS_AUTH_ITEM_NAME, JSON.stringify(userCredential));
};
