import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { Store } from '@ngrx/store';
import { filter, Observable, of, Subscription, take } from 'rxjs';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { AppState } from '@app/store/app.state';
import { RouterLink } from '@angular/router';
import { IUserTransactionsData } from '@app/shared/models/purchase.model';
import { CheckoutService } from '@app/core/services/checkout.service';
import { IProduct } from '@app/shared/models/product.model';
import { DatabaseService } from '@app/core/services/database.service';

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
  private databaseService = inject(DatabaseService);

  onlineStatus: boolean = false;
  user$!: Observable<IUser | null>;
  favorites$!: Observable<IProduct[]>;
  transactionsData$!: Observable<IUserTransactionsData | null>;
  lastViewedProduct$!: Observable<string>;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const onlineStatusSubscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        this.onlineStatus = user?.online!;
      });

    const userSubscription = this.store
      .select(UserSelectors.selectUser)
      .pipe(take(1))
      .subscribe((user) => {
        this.user$ = of(user);

        if (user) {
          this.lastViewedProduct$ = this.databaseService.getLastViewedProduct(
            user?.userCredential?.providerData[0].email!
          );
        }
      });

    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .subscribe((customer) => {
        if (customer?.id) {
          this.transactionsData$ =
            this.checkoutService.getUserTransactionsDataFromDB(customer.id);
        }
      });

    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);

    this.subscriptions.push(
      onlineStatusSubscription,
      userSubscription,
      customerSubscription
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe);
  }
}
