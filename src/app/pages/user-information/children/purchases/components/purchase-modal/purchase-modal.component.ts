import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-purchase-modal',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './purchase-modal.component.html',
  styleUrl: './purchase-modal.component.scss',
})
export class PurchaseModalComponent {
  public bsModalRef = inject(BsModalRef);

  title?: string;
  transaction?: ISupplementedCharge;
}
