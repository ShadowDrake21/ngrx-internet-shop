import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import Stripe from 'stripe';

@Component({
  selector: 'app-view-customer-information',
  imports: [DatePipe],
  templateUrl: './view-customer-information.component.html',
  styleUrl: './view-customer-information.component.scss',
})
export class ViewCustomerInformationComponent {
  @Input({ required: true })
  customer!: Stripe.Customer;
}
