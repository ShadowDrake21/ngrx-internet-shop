// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  debounceTime,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import Stripe from 'stripe';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipDirective, TooltipModule } from 'ngx-bootstrap/tooltip';
import { ReactiveFormsModule } from '@angular/forms';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// components
import { CustomerInformationComponent } from './components/customer-information/customer-information.component';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { PurchasesListComponent } from './components/purchases-list/purchases-list.component';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';

// content
import { userInformationContent } from '../../content/user-information.content';

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

  private store = inject(Store<AppState>);

  customer$!: Observable<Stripe.Customer | null>;
  transactions$!: Observable<ISupplementedCharge[]>;

  purchasesLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.purchasesLoading = true;
    combineLatest([
      this.store.select(PurchaseSelectors.selectCustomer),
      this.store.select(PurchaseSelectors.selectTransactions),
    ])
      .pipe(debounceTime(2000))
      .subscribe(([customer, transactions]) => {
        this.customer$ = of(customer);
        this.transactions$ = of(transactions);
        this.purchasesLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
