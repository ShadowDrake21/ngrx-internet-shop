import { FormControl, FormGroup } from '@angular/forms';

export interface IAuthCredentials {
  email: string;
  password: string;
}

export type ISignInForm = FormGroup<{
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  rememberMe: FormControl<boolean | null>;
}>;

export type ISingUpForm = FormGroup<{
  displayName: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  confirmPassword: FormControl<string | null>;
}>;

export type SocialProvider = 'facebook' | 'twitter' | 'google';
