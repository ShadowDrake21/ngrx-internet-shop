// angular stuff
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BsModalRef } from 'ngx-bootstrap/modal';

// created ngrx stuffs
import { UserState } from '@store/user/user.reducer';
import * as UserActions from '@store/user/user.actions';

@Component({
  selector: 'app-expiration-modal',
  standalone: true,
  imports: [],
  templateUrl: './expiration-modal.component.html',
  styleUrl: './expiration-modal.component.scss',
})
export class ExpirationModalComponent implements OnInit {
  private store = inject(Store<UserState>);
  private router = inject(Router);
  public bsModalRef = inject(BsModalRef);

  ngOnInit(): void {
    this.store.dispatch(UserActions.signOut());
  }

  onSignIn() {
    this.router.navigate(['/sign-in']);
    this.bsModalRef?.hide();
  }
}
