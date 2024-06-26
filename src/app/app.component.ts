// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import Stripe from 'stripe';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';

// interfaces
import { IStoreUserCredential } from '@models/user.model';

// components
import { HeaderComponent } from '@shared/components/header/header.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { ExpirationModalComponent } from '@shared/components/expiration-modal/expiration-modal.component';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as UserActions from '@store/user/user.actions';
import * as UserSelectors from '@store/user/user.selectors';
import * as FavoritesActions from '@store/favorites/favorites.actions';
import * as PurchaseActions from '@store/purchase/purchase.actions';

import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// constants
import { LS_AUTH_ITEM_NAME } from '@core/constants/auth.constants';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { CheckoutLoadingComponent } from './shared/components/checkout-loading/checkout-loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BreadcrumbsComponent,
    CheckoutLoadingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [BsModalService],
})
export class AppComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private router = inject(Router);
  private modalService = inject(BsModalService);

  public headerFooterAvailable: boolean = true;
  checkoutLoading$!: Observable<boolean>;

  bsModalRef?: BsModalRef;

  private destroy$$: Subject<void> = new Subject<void>();

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.getDataFromStorages();

    this.router.events
      .pipe(takeUntil(this.destroy$$))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          if (
            this.router.url === '/sign-in' ||
            this.router.url === '/sign-up' ||
            this.router.url.includes('/user-information')
          ) {
            this.headerFooterAvailable = false;
          } else {
            this.headerFooterAvailable = true;
          }
        }
      });
    this.store.dispatch(FavoritesActions.loadAllFavorites());
    this.checkExpirationTime();

    this.checkoutLoading$ = this.store.select(PurchaseSelectors.selectLoading);
  }

  getDataFromStorages() {
    const userCredential: IStoreUserCredential | null = JSON.parse(
      localStorage.getItem(LS_AUTH_ITEM_NAME)!
    );
    const customer: Stripe.Customer | null = JSON.parse(
      sessionStorage.getItem('customer')!
    );

    if (userCredential) {
      this.store.dispatch(
        UserActions.browserReload({
          email: userCredential.providerData[0].email,
          userCredential,
        })
      );
    }
    if (customer) {
      this.store.dispatch(PurchaseActions.browserReload({ customer }));
    } else {
      this.loadCustomer();
    }
  }

  loadCustomer() {
    const userSubscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        if (user) {
          this.store.dispatch(
            PurchaseActions.getCustomer({
              email: user.userCredential?.providerData[0].email!,
            })
          );
        }
      });

    this.subscriptions.push(userSubscription);
  }

  checkExpirationTime() {
    const userString = localStorage.getItem(LS_AUTH_ITEM_NAME);
    let user: IStoreUserCredential | null = null;
    if (userString) {
      user = JSON.parse(userString);

      if (new Date(user?.tokenResult.expirationTime!) <= new Date()) {
        localStorage.removeItem(LS_AUTH_ITEM_NAME);

        (document.querySelector('#openModalBtn') as HTMLButtonElement).click();
      }
    }
  }

  openModal() {
    this.bsModalRef = this.modalService.show(ExpirationModalComponent);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
