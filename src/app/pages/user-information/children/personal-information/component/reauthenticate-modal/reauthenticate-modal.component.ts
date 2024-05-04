import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@app/core/authentication/auth.service';
import { FirebaseError } from 'firebase/app';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-reauthenticate-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reauthenticate-modal.component.html',
  styleUrl: './reauthenticate-modal.component.scss',
})
export class ReauthenticateModalComponent {
  private authService = inject(AuthService);
  public bsModalRef = inject(BsModalRef);

  @Output() occuredError: EventEmitter<string> = new EventEmitter<string>();

  email?: string;
  closeBtnName?: string;
  error: string = '';

  isSuccessReauthentication: boolean = false;

  reauthenticationForm = new FormGroup({
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20),
    ]),
  });

  onReauthenticationSubmit() {
    this.authService
      .reauthenticateUser(
        this.email!,
        this.reauthenticationForm.value.password!
      )
      .then((credential) => {
        console.log('Reauthentication success!');
        this.isSuccessReauthentication = true;
        this.bsModalRef.hide();
      })
      .catch((err: FirebaseError) => {
        this.error = err.message;
        this.isSuccessReauthentication = false;
        this.occuredError.emit(err.message);
      });
  }
}
