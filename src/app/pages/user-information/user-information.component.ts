import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { RoutingService } from '@app/core/services/routing.service';

import { userInformationSidebar } from '@app/shared/utils/icons.utils';
import { AppState } from '@app/store/app.state';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import { TabsModule } from 'ngx-bootstrap/tabs';

import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { Observable, Subscription, tap } from 'rxjs';
import { IUser } from '@app/shared/models/user.model';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import * as UserActions from '@store/user/user.actions';
import { LS_AUTH_ITEM_NAME } from '@app/core/constants/auth.constants';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { IProduct } from '@app/shared/models/product.model';
import { IUserTransactionsData } from '@app/shared/models/purchase.model';
import { CheckoutService } from '@app/core/services/checkout.service';

@Component({
  selector: 'app-user-information',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FontAwesomeModule,
    TabsModule,
    RouterLink,
    RouterLinkActive,
    TruncateTextPipe,
  ],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.scss',
  providers: [BsModalService],
})
export class UserInformationComponent implements OnInit, OnDestroy {
  sidebarIcons = userInformationSidebar;

  private store = inject(Store<AppState>);
  private router = inject(Router);
  private routingService = inject(RoutingService);
  private modalService = inject(BsModalService);
  private checkoutService = inject(CheckoutService);

  onlineStatus: boolean = false;
  user$!: Observable<IUser | null>;
  favorites$!: Observable<IProduct[]>;
  transactionsData$!: Observable<IUserTransactionsData | null>;

  bsModalRef?: BsModalRef;

  previousRoute!: string;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
    const emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .subscribe((email) => {
        this.store.dispatch(PurchaseActions.getCustomer({ email: email! }));
        this.user$ = this.store.select(UserSelectors.selectUser);

        const customerSubscription = this.store
          .select(PurchaseSelectors.selectCustomer)
          .subscribe((customer) => {
            if (customer) {
              this.store.dispatch(
                PurchaseActions.getAllTransactions({ customerId: customer?.id })
              );
            }
          });
        this.subscriptions.push(customerSubscription);
      });

    this.subscriptions.push(emailSubscription);
  }

  onProfileOpen() {
    const initialState: ModalOptions = {
      initialState: {
        // data
      },
    };
  }

  // make!!!
  formProfileModalData() {
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
          this.transactionsData$ =
            this.checkoutService.getUserTransactionsDataFromDB(customer.id);
        }
      });

    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);

    this.subscriptions.push(userSubscription, customerSubscription);

    let userPart: any = {};
    this.user$.subscribe((user) => {
      userPart = { user };
    });

    // const profileData =
  }

  onSignOut() {
    this.store.dispatch(UserActions.signOut());
    localStorage.removeItem(LS_AUTH_ITEM_NAME);
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
