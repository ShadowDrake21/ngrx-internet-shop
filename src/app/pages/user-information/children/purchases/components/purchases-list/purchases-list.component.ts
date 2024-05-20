import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
import { Store } from '@ngrx/store';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import {
  delay,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  take,
  tap,
} from 'rxjs';
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
  @Input({ required: true, alias: 'transactions' })
  transactions$!: Observable<ISupplementedCharge[]>;

  visibleTransactions$!: Observable<ISupplementedCharge[]>;

  transactionsLoading: boolean = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.transactionsLoading = false;
    }, 2000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.transactions$) {
      this.visibleTransactions$ = this.sliceTransactions(0, 4);
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.visibleTransactions$ = this.sliceTransactions(startItem, endItem);
  }

  sliceTransactions(
    start: number,
    end: number
  ): Observable<ISupplementedCharge[]> {
    return this.transactions$.pipe(
      map((transactions) => {
        return transactions.slice(start, end);
      })
    );
  }
}
