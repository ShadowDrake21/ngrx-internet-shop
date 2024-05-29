// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';

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
