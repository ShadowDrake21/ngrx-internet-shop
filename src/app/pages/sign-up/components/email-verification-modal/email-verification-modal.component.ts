import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { UserState } from '../../../../store/user/user.reducer';
import { Observable } from 'rxjs';
import * as UserActions from '../../../../store/user/user.actions';
import * as UserSelectors from '../../../../store/user/user.selectors';

@Component({
  selector: 'app-email-verification-modal',
  standalone: true,
  imports: [],
  templateUrl: './email-verification-modal.component.html',
  styleUrl: './email-verification-modal.component.scss',
})
export class EmailVerificationModalComponent implements OnInit, OnDestroy {
  private store = inject(Store<UserState>);
  public bsModalRef = inject(BsModalRef);

  email$!: Observable<string | null>;

  ngOnInit(): void {
    this.sendVefirication();
    this.email$ = this.store.select(UserSelectors.selectEmail);
  }

  sendVefirication() {
    this.store.dispatch(UserActions.sendEmailVerification());
  }

  ngOnDestroy(): void {
    this.store.dispatch(UserActions.getUser());
    // ???
  }
}
