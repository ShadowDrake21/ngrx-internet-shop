// angular stuff
import { CommonModule } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Component, inject, Input } from '@angular/core';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';

// components
import { PurchaseModalComponent } from '../purchase-modal/purchase-modal.component';

@Component({
  selector: 'app-purchase-thumbnail',
  standalone: true,
  imports: [CommonModule, PurchaseModalComponent],
  templateUrl: './purchase-thumbnail.component.html',
  styleUrl: './purchase-thumbnail.component.scss',
  providers: [BsModalService],
})
export class PurchaseThumbnailComponent {
  @Input({ required: true }) transaction!: ISupplementedCharge;
  private modalService = inject(BsModalService);

  bsModalRef?: BsModalRef;

  openModalWithComponent() {
    const initialState: ModalOptions = {
      initialState: {
        transaction: this.transaction,
        title: `Purchase: ${this.transaction.charge.id}`,
      },
    };
    this.bsModalRef = this.modalService.show(
      PurchaseModalComponent,
      initialState
    );
    this.bsModalRef.setClass('full-screen__modal modal-dialog-centered');
  }
}
