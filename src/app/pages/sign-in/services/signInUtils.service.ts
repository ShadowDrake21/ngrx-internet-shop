import { inject, Injectable } from '@angular/core';
import { SignInService } from '@app/core/services/signIn.service';
import { AlertType } from '@app/shared/models/alerts.model';
import { ModalOptions, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Injectable()
export class SignInUtilsService {
  private readonly modalService = inject(BsModalService);
  private readonly modalsClasses = 'sign-in__modals modal-dialog-centered';
  private readonly signInService = inject(SignInService);

  bsModalRef?: BsModalRef;

  showModal(component: any, options?: ModalOptions): void {
    this.bsModalRef = this.modalService.show(component, options);
    this.bsModalRef.setClass(this.modalsClasses);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  showErrorAlert(message: string): AlertType {
    return this.signInService.setAlert('danger', message, 5000);
  }
}
