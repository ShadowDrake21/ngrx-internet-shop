// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, of, Subscription } from 'rxjs';

// created ngrx stuff
import { UserState } from '@store/user/user.reducer';
import * as UserActions from '@store/user/user.actions';
import * as UserSelectors from '@store/user/user.selectors';

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

  private emailSubscription!: Subscription;

  ngOnInit(): void {
    this.sendVefirication();
    this.emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .subscribe((email) => {
        this.email$ = of(email);
      });
  }

  sendVefirication() {
    this.store.dispatch(UserActions.sendEmailVerification());
  }

  ngOnDestroy(): void {
    this.emailSubscription.unsubscribe();
  }
}
