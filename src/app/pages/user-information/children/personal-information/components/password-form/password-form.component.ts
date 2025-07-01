import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'personal-information-password-form',
  imports: [ReactiveFormsModule, FormsModule, FontAwesomeModule],
  templateUrl: './password-form.component.html',
  styleUrl: './password-form.component.scss',
})
export class PasswordFormComponent implements OnChanges {
  @Input() passwordForm!: FormGroup;
  @Input() isPasswordChangeMode = false;
  @Input() passwordIcon: any;

  @Output() savePassword = new EventEmitter<void>();
  @Output() cancelPasswordChange = new EventEmitter<void>();
  @Output() togglePasswordChange = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isPasswordChangeMode']) {
      console.log('Password change mode changed:', this.isPasswordChangeMode);
    }
  }
  get passwordControl() {
    return this.passwordForm.get('password') as FormControl;
  }
}
