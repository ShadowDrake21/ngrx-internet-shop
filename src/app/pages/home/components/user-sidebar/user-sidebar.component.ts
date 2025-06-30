// angular stuff
import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, of, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';

// interfaces
import { IUser } from '@models/user.model';
import { IUserTransactionsData } from '@models/purchase.model';
import { IProduct } from '@models/product.model';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';

// pipes
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

// services
import { CheckoutService } from '@core/services/checkout.service';
import { DatabaseService } from '@core/services/database.service';

@Component({
  selector: 'app-user-sidebar',
  imports: [AsyncPipe, DatePipe, TruncateTextPipe, RouterLink],
  templateUrl: './user-sidebar.component.html',
  styleUrl: './user-sidebar.component.scss',
})
export class UserSidebarComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly checkoutService = inject(CheckoutService);
  private readonly databaseService = inject(DatabaseService);

  onlineStatus$!: Observable<boolean>;
  user$!: Observable<IUser | null>;
  favorites$!: Observable<IProduct[]>;
  transactionsData$!: Observable<IUserTransactionsData | null>;
  lastViewedProduct$!: Observable<string | null>;

  ngOnInit(): void {
    this.initialize();
  }

  initialize(): void {
    this.onlineStatus$ = this.store
      .select(UserSelectors.selectUser)
      .pipe(map((user) => !!user?.online));
    this.user$ = this.store.select(UserSelectors.selectUser);
    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);
    this.transactionsData$ = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        switchMap((customer) =>
          customer?.id
            ? this.checkoutService.getUserTransactionsDataFromDB(customer.id)
            : of(null)
        )
      );

    this.lastViewedProduct$ = this.store
      .select(UserSelectors.selectUser)
      .pipe(
        switchMap((user) =>
          user?.userCredential?.providerData[0].email
            ? this.databaseService.getLastViewedProduct(
                user.userCredential.providerData[0].email
              )
            : of(null)
        )
      );
  }
}
