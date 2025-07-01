import { Component, Input } from '@angular/core';
import { ISignInForm } from '@app/shared/models/auth.model';

@Component({
  selector: 'sign-in-form-error-messages',
  imports: [],
  templateUrl: './form-error-messages.component.html',
  styleUrl: './form-error-messages.component.scss',
})
export class FormErrorMessagesComponent {
  @Input({ required: true }) form!: ISignInForm;
}
