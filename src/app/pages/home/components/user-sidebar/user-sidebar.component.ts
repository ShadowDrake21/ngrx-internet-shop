import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { UserState } from '@app/store/user/user.reducer';
import { Store } from '@ngrx/store';
import { Observable, Subscription, tap } from 'rxjs';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { AppState } from '@app/store/app.state';
import { RouterLink } from '@angular/router';
import { IUserTransactionsData } from '@app/shared/models/purchase.model';
import { CheckoutService } from '@app/core/services/checkout.service';

@Component({
  selector: 'app-user-sidebar',
  standalone: true,
  imports: [CommonModule, TruncateTextPipe, RouterLink],
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.scss',
})
export class UserSidebarComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private checkoutService = inject(CheckoutService);

  onlineStatus: boolean = false;
  user$!: Observable<IUser | null>;
  favorites$!: Observable<number[]>;
  transactionsData$!: Observable<IUserTransactionsData | null>;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.user$ = this.store.select(UserSelectors.selectUser).pipe(
      tap((user) => (this.onlineStatus = user?.online!)),
      tap((user) =>
        this.store.dispatch(
          PurchaseActions.getCustomer({
            email: user?.userCredential?.providerData[0].email!,
          })
        )
      )
    );

    const userSubscription = this.user$.subscribe();

    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .subscribe((customer) => {
        if (customer?.id) {
          console.log('customer?.id', customer?.id);
          this.transactionsData$ =
            this.checkoutService.getUserTransactionsDataFromDB(customer.id);
        }
      });

    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);

    this.subscriptions.push(userSubscription, customerSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe);
  }
}
