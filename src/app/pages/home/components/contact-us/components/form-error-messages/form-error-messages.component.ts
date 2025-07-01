import { Component, Input, input } from '@angular/core';
import { ContactUsForm } from '../../types/form.types';

@Component({
  selector: 'contact-us-form-error-messages',
  imports: [],
  templateUrl: './form-error-messages.component.html',
  styleUrl: './form-error-messages.component.scss',
})
export class FormErrorMessagesComponent {
  @Input({ required: true, alias: 'form' }) contactUsForm!: ContactUsForm;
}
