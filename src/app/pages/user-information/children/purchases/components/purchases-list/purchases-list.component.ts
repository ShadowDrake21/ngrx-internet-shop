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
export class PurchasesListComponent {
  @Input({ required: true, alias: 'transactions' })
  transactions$!: Observable<ISupplementedCharge[]>;
}
