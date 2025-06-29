import { Component, Input } from '@angular/core';
import { IShippingForm } from '../../types/form.types';
import { deliveryRecordFormErrorMessages } from './content/error-messages.content';

@Component({
  selector: 'delivery-record-form-error-messages',
  imports: [],
  templateUrl: './form-error-messages.component.html',
  styleUrl: './form-error-messages.component.scss',
})
export class FormErrorMessagesComponent {
  readonly errorMessages = deliveryRecordFormErrorMessages;
  @Input({ required: true }) form!: IShippingForm;
}
