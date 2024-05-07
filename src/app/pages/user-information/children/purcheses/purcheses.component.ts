import { Component, inject, OnInit } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CheckoutService } from '@app/core/services/checkout.service';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
@Component({
  selector: 'app-purcheses',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './purcheses.component.html',
  styleUrl: './purcheses.component.scss',
})
export class PurchesesComponent implements OnInit {
  userInformationItem = userInformationContent[2];

  private store = inject(Store<AppState>);
  private checkoutService = inject(CheckoutService);

  ngOnInit() {
    this.store.select(UserSelectors.selectEmail).subscribe((email) => {
      this.store.dispatch(PurchaseActions.getCustomer({ email: email! }));
    });
  }
}
