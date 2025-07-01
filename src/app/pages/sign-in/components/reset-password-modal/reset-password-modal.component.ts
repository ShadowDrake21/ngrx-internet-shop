// angular stuff
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormsModule, NgForm } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserActions from '@store/user/user.actions';

@Component({
  selector: 'app-reset-password-modal',
  imports: [FormsModule],
  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.scss',
})
export class ResetPasswordModalComponent {
  private readonly store = inject(Store<UserState>);
  private readonly _bsModalRef = inject(BsModalRef);

  closeBtnName?: string;
  afterSubmit: boolean = false;
  private readonly resetTimeout = 6000;

  onSubmit(form: NgForm) {
    const email = form.value.email as string;
    this.store.dispatch(UserActions.sendPasswordReset({ email }));

    this.afterSubmit = true;

    setTimeout(() => {
      this.closeModal();
    }, this.resetTimeout);
  }

  private closeModal(): void {
    this.afterSubmit = false;
    this._bsModalRef?.hide();
  }

  get bsModalRef() {
    return this._bsModalRef;
  }
}
