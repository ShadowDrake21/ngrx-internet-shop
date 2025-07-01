import { Injectable } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ISingUpForm } from '@app/shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly MIN_NAME_LENGTH = 3;
  private readonly MAX_NAME_LENGTH = 20;
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly MAX_PASSWORD_LENGTH = 20;

  getSignUpForm(): ISingUpForm {
    return new FormGroup(
      {
        displayName: new FormControl('', [
          Validators.required,
          Validators.minLength(this.MIN_NAME_LENGTH),
          Validators.maxLength(this.MAX_NAME_LENGTH),
        ]),
        email: new FormControl('', [Validators.email, Validators.required]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(this.MIN_PASSWORD_LENGTH),
          Validators.maxLength(this.MAX_PASSWORD_LENGTH),
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(this.MIN_PASSWORD_LENGTH),
          Validators.maxLength(this.MAX_PASSWORD_LENGTH),
        ]),
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const form = control as FormGroup;
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
