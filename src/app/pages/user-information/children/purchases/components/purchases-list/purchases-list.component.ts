// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';

// components
import { PurchaseThumbnailComponent } from '../purchase-thumbnail/purchase-thumbnail.component';
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, PurchaseThumbnailComponent, PaginationModule],
  templateUrl: './purchases-list.component.html',
  styleUrl: './purchases-list.component.scss',
  providers: [BsModalService],
})
export class PurchasesListComponent implements OnInit {
  private store = inject(Store<PurchaseState>);

  @Input({ required: true, alias: 'transactions' })
  transactions$!: Observable<ISupplementedCharge[]>;

  transactionsError$!: Observable<string | null>;

  ngOnInit(): void {
    this.transactionsError$ = this.store.select(
      PurchaseSelectors.selectErrorMessage
    );
  }
}
