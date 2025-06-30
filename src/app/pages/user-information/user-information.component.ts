// angular stuff
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {
  combineLatest,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

// components
import { AlertComponent } from '@shared/components/alert/alert.component';
import { userInformationSidebar } from '@shared/utils/icons.utils';
import { SidebarProfileModalComponent } from './components/sidebar-profile-modal/sidebar-profile-modal.component';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import * as UserActions from '@store/user/user.actions';

// interfaces
import { IUser } from '@models/user.model';
import { AlertType } from '@models/alerts.model';
import { ISidebarModal } from './models/sidebar-modal.model';

// pipes
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

// services
import { CheckoutService } from '@core/services/checkout.service';

// constants
import { LS_AUTH_ITEM_NAME } from '@core/constants/auth.constants';
import { IUserTransactionsData } from '@app/shared/models/purchase.model';

@Component({
  selector: 'app-user-information',
  imports: [
    AsyncPipe,
    RouterOutlet,
    FontAwesomeModule,
    TabsModule,
    RouterLink,
    RouterLinkActive,
    TruncateTextPipe,
    AlertComponent,
  ],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.scss',
  providers: [BsModalService],
})
export class UserInformationComponent implements OnInit, OnDestroy {
  readonly sidebarIcons = userInformationSidebar;
  readonly modalClasses = 'modal-dialog modal-dialog-centered';

  private readonly store = inject(Store<AppState>);
  private readonly router = inject(Router);
  private readonly modalService = inject(BsModalService);
  private readonly checkoutService = inject(CheckoutService);

  user$!: Observable<IUser | null>;
  bsModalRef?: BsModalRef;
  alerts: AlertType[] = [];

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.initializeCustomerData();
    this.setupErrorHadling();
  }

  private initializeCustomerData(): void {
    this.subscriptions.add(
      this.store
        .select(PurchaseSelectors.selectCustomer)
        .pipe(
          tap((customer) => {
            if (!customer) {
              this.fetchCustomerByEmail();
            }
          }),
          switchMap(() => this.fetchCustomerData())
        )
        .subscribe()
    );
  }

  private fetchCustomerByEmail(): void {
    this.subscriptions.add(
      this.store
        .select(UserSelectors.selectEmail)
        .pipe(
          take(1),
          tap((email) => {
            if (email) {
              this.store.dispatch(PurchaseActions.getCustomer({ email }));
            }
          })
        )
        .subscribe()
    );
  }

  private fetchCustomerData(): Observable<void> {
    return combineLatest([
      this.store.select(UserSelectors.selectUser),
      this.store.select(PurchaseSelectors.selectCustomer),
      this.store.select(PurchaseSelectors.selectTransactions),
    ]).pipe(
      tap(([user]) => (this.user$ = of(user))),
      tap(([, customer, transactions]) => {
        if (customer && transactions.length === 0) {
          this.store.dispatch(
            PurchaseActions.getAllTransactions({ customerId: customer.id })
          );
        }
      }),
      map(() => void 0)
    );
  }

  onProfileOpen() {
    this.formProfileModalData().subscribe((profileData) =>
      this.showProfileModal(profileData)
    );
  }

  private showProfileModal(profileData: ISidebarModal): void {
    const initialState: ModalOptions = {
      initialState: {
        profileData,
      },
    };

    this.bsModalRef = this.modalService.show(
      SidebarProfileModalComponent,
      initialState
    );
    this.bsModalRef?.setClass(this.modalClasses);
  }

  formProfileModalData(): Observable<ISidebarModal> {
    return combineLatest([
      this.store.select(UserSelectors.selectUser),
      this.store.select(PurchaseSelectors.selectCustomer),
      this.store.select(FavoritesSelectors.selectFavorites),
    ]).pipe(
      switchMap(([user, customer, favorites]) =>
        this.checkoutService
          .getUserTransactionsDataFromDB(customer?.id! ?? '')
          .pipe(map((statisticData) => ({ user, statisticData, favorites })))
      ),
      map(({ user, statisticData, favorites }) =>
        this.mapToSidebarModal(user, statisticData, favorites.length)
      )
    );
  }

  private mapToSidebarModal(
    user: IUser | null,
    statisticsData: IUserTransactionsData | null,
    favoriteCount: number
  ): ISidebarModal {
    const providerData = user?.userCredential?.providerData[0];
    const tokenResult = user?.userCredential?.tokenResult;

    return {
      user: {
        email: providerData?.email ?? '',
        displayName: providerData?.displayName ?? '',
        photoUrl: providerData?.photoURL ?? '',
        authTime: tokenResult?.authTime ?? '',
        authExpirationTime: tokenResult?.expirationTime ?? '',
        provider: tokenResult?.signInProvider ?? '',
        emailVerified: user?.userCredential?.emailVerified ?? false,
        onlineStatus: user?.online ?? false,
      },
      favoritesCount: favoriteCount,
      transactions: {
        transactionsCount: statisticsData?.count ?? 0,
        transactionsPrice: statisticsData?.price ?? 0,
      },
    };
  }

  private setupErrorHadling() {
    this.subscriptions.add(
      combineLatest([
        this.store.select(UserSelectors.selectErrorMessage),
        this.store.select(PurchaseSelectors.selectCustomer),
      ]).subscribe(([errorMessage, customer]) => {
        if (errorMessage && customer) {
          this.alerts = [
            {
              msg: errorMessage,
              timeout: 5000,
              type: 'danger',
            },
          ];
        }
      })
    );
  }

  onSignOut() {
    this.store.dispatch(UserActions.signOut());
    localStorage.removeItem(LS_AUTH_ITEM_NAME);
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
