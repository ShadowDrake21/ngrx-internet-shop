import { TitleCasePipe, AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicCardComponent } from '@app/pages/user-information/components/basic-card/basic-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AlertComponent } from 'ngx-bootstrap/alert';

@Component({
  selector: 'personal-information-password-form',
  imports: [
    BasicCardComponent,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    AlertComponent,
    TitleCasePipe,
    AsyncPipe,
  ],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.scss',
})
export class PasswordFormComponent {
  @Input() passwordForm!: FormGroup;
  @Input() isPasswordChangeMode = false;
  @Input() passwordIcon: any;

  @Output() savePassword = new EventEmitter<void>();
  @Output() cancelPasswordChange = new EventEmitter<void>();
  @Output() togglePasswordChange = new EventEmitter<void>();

  get passwordControl() {
    return this.passwordForm.get('password') as FormControl;
  }
}
