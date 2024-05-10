import { Component, inject, OnInit } from '@angular/core';
import { CheckoutService } from '@app/core/services/checkout.service';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [],
  templateUrl: './purchases-list.component.html',
  styleUrl: './purchases-list.component.scss',
})
export class PurchasesListComponent implements OnInit {
  private checkoutService = inject(CheckoutService);

  // in state customer payment_intent!!!, search by that!
  ngOnInit(): void {
    this.checkoutService.getTransactionProducts(
      'cus_Q3slllvYAYyxSY',
      'pi_3PEsndAGBN9qzN7Z0LlCIhad'
    );
  }
}
