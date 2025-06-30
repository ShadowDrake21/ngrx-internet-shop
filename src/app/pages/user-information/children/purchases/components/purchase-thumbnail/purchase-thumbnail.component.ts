// angular stuff
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Component, inject, Input } from '@angular/core';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';
import { PurchaseModalComponent } from '../purchase-modal/purchase-modal.component';

@Component({
  selector: 'app-purchase-thumbnail',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './purchase-thumbnail.component.html',
  styleUrl: './purchase-thumbnail.component.scss',
  providers: [BsModalService],
})
export class PurchaseThumbnailComponent {
  private readonly modalService = inject(BsModalService);
  @Input({ required: true }) transaction!: ISupplementedCharge;

  modalRef?: BsModalRef;

  openModalWithComponent() {
    const initialState = this.createModalOptions();
    this.modalRef = this.modalService.show(
      PurchaseModalComponent,
      initialState
    );
    this.setModalStyles();
  }

  private createModalOptions(): ModalOptions {
    return {
      initialState: {
        transaction: this.transaction,
        title: `Purchase: ${this.transaction.charge.id}`,
      },
    };
  }

  private setModalStyles(): void {
    this.modalRef?.setClass('full-screen__modal modal-dialog-centered');
  }
}
