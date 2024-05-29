// angular stuff
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserActions from '@store/user/user.actions';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],

  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.scss',
})
export class ResetPasswordModalComponent implements OnInit {
  private store = inject(Store<UserState>);
  public bsModalRef = inject(BsModalRef);

  closeBtnName?: string;

  afterSubmit: boolean = false;

  ngOnInit(): void {}

  onSubmit(form: NgForm) {
    const email = form.value.email as string;
    this.store.dispatch(UserActions.sendPasswordReset({ email }));

    this.afterSubmit = true;

    setTimeout(() => {
      this.afterSubmit = false;
      this.bsModalRef?.hide();
    }, 6000);
  }
}
