import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICustomerUpdateForm } from '../../types/form.types';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AddressFormComponent } from '../address-form/address-form.component';

@Component({
  selector: 'app-edit-customer-information',
  imports: [ReactiveFormsModule, TooltipModule, AddressFormComponent],
  templateUrl: './edit-customer-information.component.html',
  styleUrl: './edit-customer-information.component.scss',
})
export class EditCustomerInformationComponent {
  @Input({ required: true }) form!: ICustomerUpdateForm;

  @Output() onSubmit = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onReset = new EventEmitter<void>();
}
