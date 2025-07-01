import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AddressGroup } from '../../types/form.types';

@Component({
  selector: 'app-address-form',
  imports: [ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss',
})
export class AddressFormComponent {
  @Input({ required: true }) formGroup!: AddressGroup;
  @Input() groupName = '';
}
