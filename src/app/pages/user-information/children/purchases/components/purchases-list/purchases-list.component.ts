import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';
import { map, Observable } from 'rxjs';
import { PurchaseThumbnailComponent } from '../purchase-thumbnail/purchase-thumbnail.component';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, PurchaseThumbnailComponent, PaginationModule],
  templateUrl: './purchases-list.component.html',
  styleUrl: './purchases-list.component.scss',
  providers: [BsModalService],
})
export class PurchasesListComponent implements OnChanges {
  @Input({ required: true, alias: 'transactions' })
  transactions$!: Observable<ISupplementedCharge[]>;

  visibleTransactions$!: Observable<ISupplementedCharge[]>;

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
