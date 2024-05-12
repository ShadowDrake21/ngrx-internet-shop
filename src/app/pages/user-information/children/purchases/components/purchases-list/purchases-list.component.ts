import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ISupplementedCharge,
  ISupplementedTransactions,
} from '@app/shared/models/purchase.model';
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
import { Store } from '@ngrx/store';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { map, Observable, of, Subscription } from 'rxjs';
import { PurchaseThumbnailComponent } from '../purchase-thumbnail/purchase-thumbnail.component';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppState } from '@app/store/app.state';
import Stripe from 'stripe';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, PurchaseThumbnailComponent, PaginationModule],
  templateUrl: './purchases-list.component.html',
  styleUrl: './purchases-list.component.scss',
  providers: [BsModalService],
})
export class PurchasesListComponent implements OnInit, OnChanges {
  @Input({ required: true, alias: 'customer' })
  customer$!: Observable<Stripe.Customer | null>;

  private store = inject(Store<AppState>);
  supplementedTransactions$!: Observable<ISupplementedTransactions>;
  visibleTransactions$!: Observable<ISupplementedCharge[]>;

  private subscriptions: Subscription[] = [];
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.customer$) {
      const customerSubscription = this.customer$.subscribe((customer) => {
        if (customer) {
          this.store.dispatch(
            PurchaseActions.getAllTransactions({ customerId: customer?.id })
          );
          const transactionsSubscription = this.store
            .select(PurchaseSelectors.selectTransactions)
            .subscribe(
              (supplementedTransactions) =>
                (this.supplementedTransactions$ = of(supplementedTransactions!))
            );

          this.subscriptions.push(transactionsSubscription);
        }
      });
      this.subscriptions.push(customerSubscription);

      this.visibleTransactions$ = this.sliceTransactions(0, 4);
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.visibleTransactions$ = this.sliceTransactions(startItem, endItem);
  }

  // has_more pagination!!!

  sliceTransactions(
    start: number,
    end: number
  ): Observable<ISupplementedCharge[]> {
    return this.supplementedTransactions$.pipe(
      map(({ transactions }) => transactions.slice(start, end))
    );
  }
}
