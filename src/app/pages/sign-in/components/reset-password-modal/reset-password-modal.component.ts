import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserState } from '../../../../store/user/user.reducer';
import * as UserActions from '../../../../store/user/user.actions';
import * as UserSelectors from '../../../../store/user/user.selectors';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { AlertType } from '../../../../shared/models/alerts.model';
import { AuthService } from '../../../../core/authentication/auth.service';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],

  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.scss',
})
export class ResetPasswordModalComponent implements OnInit {
  private store = inject(Store<UserState>);
  private router = inject(Router);
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
