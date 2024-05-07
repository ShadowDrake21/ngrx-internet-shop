import { Component, inject, OnInit } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CheckoutService } from '@app/core/services/checkout.service';

@Component({
  selector: 'app-purcheses',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './purcheses.component.html',
  styleUrl: './purcheses.component.scss',
})
export class PurchesesComponent implements OnInit {
  userInformationItem = userInformationContent[2];

  private checkoutService = inject(CheckoutService);

  async ngOnInit(): Promise<void> {
    await this.checkoutService.getCustomer();
    await this.checkoutService.getAllTransactions();
  }
}
