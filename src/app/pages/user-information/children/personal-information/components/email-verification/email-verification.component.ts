import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'personal-information-email-verification',
  imports: [],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss',
})
export class EmailVerificationComponent {
  @Input() emailVerified = false;
  @Input() wasEmailVerificationSent = false;
  @Output() verifyEmail = new EventEmitter<void>();
}
