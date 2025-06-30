// angular stuff
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  debounceTime,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import Stripe from 'stripe';
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
  imports: [
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
  readonly userInformationItem = userInformationContent[2];
  private readonly store = inject(Store<AppState>);

  customer$: Observable<Stripe.Customer | null> = this.store.select(
    PurchaseSelectors.selectCustomer
  );
  transactions$: Observable<ISupplementedCharge[]> = this.store.select(
    PurchaseSelectors.selectTransactions
  );

  isLoading = signal(true);
  private subscriptions = new Subscription();

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([this.customer$, this.transactions$])
        .pipe(debounceTime(2000))
        .subscribe({
          next: () => this.isLoading.set(false),
          error: () => this.isLoading.set(false),
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
