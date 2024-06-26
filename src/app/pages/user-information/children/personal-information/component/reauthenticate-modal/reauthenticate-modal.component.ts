// angular stuff
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { User, UserCredential } from 'firebase/auth';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { concatMap, of, Subscription } from 'rxjs';

// services
import { AuthService } from '@core/authentication/auth.service';
import { SignInService } from '@core/services/signIn.service';

// utils
import { minimalizeUserCredential } from '@shared/utils/store.utils';

@Component({
  selector: 'app-reauthenticate-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reauthenticate-modal.component.html',
  styleUrl: './reauthenticate-modal.component.scss',
  providers: [SignInService],
})
export class ReauthenticateModalComponent implements OnDestroy {
  private authService = inject(AuthService);
  public bsModalRef = inject(BsModalRef);
  private signInService = inject(SignInService);

  @Output() occuredError: EventEmitter<string> = new EventEmitter<string>();

  email?: string;
  closeBtnName?: string;
  isChangePassword?: boolean = true;
  error: string = '';

  isSuccessReauthentication: boolean | null = null;

  reauthenticationForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
    rememberMe: new FormControl(true),
  });

  private reauthenticationSubscription!: Subscription;

  onReauthenticationSubmit() {
    this.reauthenticationSubscription = this.authService
      .reauthenticateUser(
        this.email!,
        this.reauthenticationForm.value.password!
      )
      .pipe(
        concatMap((credential: UserCredential) =>
          this.authService.getProfileImage().pipe(
            concatMap(async (imageURL: string) => {
              const updatedUser: User = {
                ...credential.user,
                providerData: [
                  {
                    ...credential.user.providerData[0],
                    photoURL: imageURL,
                  },
                ],
                getIdToken: credential.user.getIdToken,
                getIdTokenResult: credential.user.getIdTokenResult,
              };

              const updatedUserCredential: UserCredential = {
                ...credential,
                user: updatedUser,
              };
              return of(
                this.signInService.signInManuallyFormReducedUserCredential(
                  await minimalizeUserCredential(updatedUserCredential),
                  this.reauthenticationForm.value.rememberMe!
                )
              );
            })
          )
        )
      )
      .subscribe({
        next: () => {
          this.isSuccessReauthentication = true;
          this.bsModalRef.hide();
        },
        error: (error) => {
          this.error = error.message;
          this.isSuccessReauthentication = false;
          this.occuredError.emit(error.message);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.reauthenticationSubscription)
      this.reauthenticationSubscription.unsubscribe();
  }
}
