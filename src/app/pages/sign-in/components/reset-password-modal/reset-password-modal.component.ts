import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserState } from '../../../../store/user/user.reducer';
import * as UserActions from '../../../../store/user/user.actions';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

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

  ngOnInit(): void {}

  onSubmit(form: NgForm) {
    console.log('reset password form', form.value);
  }

  onSignIn() {
    this.router.navigate(['/sign-in']);
    this.bsModalRef?.hide();
  }
}
