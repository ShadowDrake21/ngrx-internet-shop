import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { Observable, Subscription } from 'rxjs';
import Stripe from 'stripe';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipDirective, TooltipModule } from 'ngx-bootstrap/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerInformationComponent } from './components/customer-information/customer-information.component';
import { PurchasesListComponent } from './components/purchases-list/purchases-list.component';
@Component({
  selector: 'app-purcheses',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    TabsModule,
    TooltipModule,
    ReactiveFormsModule,
    CustomerInformationComponent,
    PurchasesListComponent,
  ],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss',
  providers: [TooltipDirective],
})
export class PurchasesComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[2];

  // REFACTORING + TRANSACTIONS + RENAME COMPONENTS (PURCHASE)
  private store = inject(Store<AppState>);

  customer$!: Observable<Stripe.Customer | null>;
  transactions$!: Observable<Stripe.Charge[]>;

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    // billing address???
    const emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .subscribe((email) => {
        this.store.dispatch(PurchaseActions.getCustomer({ email: email! }));
      });

    this.subscriptions.push(emailSubscription);

    this.customer$ = this.store.select(PurchaseSelectors.selectCustomer);

    const customerSubscription = this.customer$.subscribe((customer) => {
      if (customer) {
        this.store.dispatch(
          PurchaseActions.getAllTransactions({ customerId: customer?.id })
        );
      }
    });
    this.subscriptions.push(customerSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}