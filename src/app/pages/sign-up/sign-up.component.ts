import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { UserState } from '../../store/user/user.reducer';
import * as UserActions from '../../store/user/user.actions';
import * as UserSelectors from '../../store/user/user.selectors';
import { IUserSignUpData } from '../../shared/models/user.model';
import { Router } from '@angular/router';
import { delay, map, Observable, of, switchMap } from 'rxjs';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  refreshIcon = faRefresh;
  private store = inject(Store<UserState>);
  private router = inject(Router);

  error$!: Observable<string | null>;

  signUpForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
      Validators.pattern(
        '^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$'
      ),
    ]),
    email: new FormControl('', [
      Validators.email,
      Validators.required,
      Validators.minLength(6),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
  });

  onFormSubmit() {
    const signUpData: IUserSignUpData = {
      email: this.signUpForm.value.email!,
      password: this.signUpForm.value.password!,
      username: this.signUpForm.value.username!,
    };
    this.store.dispatch(UserActions.signUp({ data: signUpData }));
    this.store.select(UserSelectors.selectUser).subscribe((user) => {
      if (user?.online) {
        this.router.navigate(['/']);
      }
    });

    this.error$ = this.store.select(UserSelectors.selectErrorMessage);
    this.error$.subscribe((error) => {
      if (error) {
        setTimeout(() => {
          this.error$ = of(null);
        }, 5000);
        this.signUpForm.reset();
      }
    });
  }
}
