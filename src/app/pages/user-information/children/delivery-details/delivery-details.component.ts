import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  phonePattern,
  countryCodePattern,
} from '../purchases/components/customer-information/constants/pattern.constants';

@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [CommonModule, BasicCardComponent, ReactiveFormsModule],
  templateUrl: './delivery-details.component.html',
  styleUrl: './delivery-details.component.scss',
})
export class DeliveryDetailsComponent {
  userInformationItem = userInformationContent[3];

  shippingForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(40),
      Validators.required,
    ]),
    phone: new FormControl('', [
      Validators.pattern(phonePattern),
      Validators.required,
    ]),
    address: new FormGroup({
      country: new FormControl('', [Validators.required]),
      city: new FormControl('', Validators.required),
      line1: new FormControl('', Validators.required),
      line2: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
    }),
  });

  onSubmit() {
    console.log('form', this.shippingForm.value);
  }
}
