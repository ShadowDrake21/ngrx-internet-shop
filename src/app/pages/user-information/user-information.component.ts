// angular stuff
import { CommonModule } from '@angular/common';
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
    SidebarProfileModalComponent,
    AlertComponent,
  ],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.scss',
  providers: [BsModalService],
})
export class UserInformationComponent implements OnInit, OnDestroy {
  sidebarIcons = userInformationSidebar;

  private store = inject(Store<AppState>);
  private router = inject(Router);
  private modalService = inject(BsModalService);
  private checkoutService = inject(CheckoutService);

  user$!: Observable<IUser | null>;

  bsModalRef?: BsModalRef;

  previousRoute!: string;

  alerts: AlertType[] = [];
  private subscriptions: Subscription[] = [];
  private modalClasses = 'modal-dialog modal-dialog-centered';

  private initializeCustomerData(): void {
    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        tap((customer) => {
          if (!customer) {
            this.store
              .select(UserSelectors.selectEmail)
              .pipe(
                tap((email) => {
                  if (email) {
                    this.store.dispatch(PurchaseActions.getCustomer({ email }));
                  }
                }),
                take(1)
              )
              .subscribe();
          }
        }),
        switchMap(() => this.fetchCustomerData())
      )
      .subscribe();

    this.subscriptions.push(customerSubscription);
  }

  private fetchCustomerData(): Observable<void> {
    return this.store.select(UserSelectors.selectUser).pipe(
      tap((user) => {
        this.user$ = of(user);
      }),
      switchMap(() =>
        combineLatest([
          this.store.select(PurchaseSelectors.selectCustomer),
          this.store.select(PurchaseSelectors.selectTransactions),
        ])
      ),
      tap(([customer, transactions]) => {
        if (customer && transactions.length === 0) {
          this.store.dispatch(
            PurchaseActions.getAllTransactions({ customerId: customer.id })
          );
        }
      }),
      map(() => void 0)
    );
  }

  ngOnInit(): void {
    this.initializeCustomerData();
    this.checkStripeFailure();
  }

  onProfileOpen() {
    const initialState: ModalOptions = {
      initialState: {
        profileData: this.formProfileModalData(),
      },
    };
    this.bsModalRef = this.modalService.show(
      SidebarProfileModalComponent,
      initialState
    );
    this.bsModalRef?.setClass(this.modalClasses);
  }

  formProfileModalData(): Observable<ISidebarModal> {
    return this.user$.pipe(
      switchMap((user) =>
        this.store.select(PurchaseSelectors.selectCustomer).pipe(
          switchMap((customer) =>
            this.checkoutService
              .getUserTransactionsDataFromDB(customer?.id!)
              .pipe(
                map((statisticsData) => ({ statisticsData, user })),
                switchMap(({ user, statisticsData }) =>
                  this.store.select(FavoritesSelectors.selectFavorites).pipe(
                    map((products) => products.length),
                    map((favoriteCount) => ({
                      user,
                      statisticsData,
                      favoriteCount,
                    }))
                  )
                )
              )
          )
        )
      ),
      map(({ statisticsData, user, favoriteCount }) => {
        const providerData = user?.userCredential?.providerData[0];
        const tokenResult = user?.userCredential?.tokenResult;

        return {
          user: {
            email: providerData?.email!,
            displayName: providerData?.displayName!,
            photoUrl: providerData?.photoURL!,
            authTime: tokenResult?.authTime!,
            authExpirationTime: tokenResult?.expirationTime!,
            provider: tokenResult?.signInProvider!,
            emailVerified: user?.userCredential?.emailVerified!,
            onlineStatus: user?.online!,
          },
          favoritesCount: favoriteCount,
          transactions: {
            transactionsCount: statisticsData?.count || 0,
            transactionsPrice: statisticsData?.price || 0,
          },
        } as ISidebarModal;
      })
    );
  }

  checkStripeFailure() {
    this.alerts = [];
    const checkStripeFailureSubscription = this.store
      .select(PurchaseSelectors.selectErrorMessage)
      .pipe(
        switchMap((errorMessage) =>
          this.store
            .select(PurchaseSelectors.selectCustomer)
            .pipe(map((customer) => ({ customer, errorMessage })))
        )
      )
      .subscribe(({ customer, errorMessage }) => {
        if (errorMessage && customer) {
          this.alerts.push({
            msg: errorMessage!,
            timeout: 5000,
            type: 'danger',
          });
        }
      });

    this.subscriptions.push(checkStripeFailureSubscription);
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
