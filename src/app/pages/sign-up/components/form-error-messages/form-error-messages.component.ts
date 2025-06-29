import { Component, Input } from '@angular/core';
import { ISingUpForm } from '@app/shared/models/auth.model';

@Component({
  selector: 'sign-up-form-error-messages',
  imports: [],
  templateUrl: './form-error-messages.component.html',
  styleUrl: './form-error-messages.component.scss',
})
export class FormErrorMessagesComponent {
  @Input({ required: true }) form!: ISingUpForm;
}
