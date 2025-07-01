// angular stuff
import {
  AsyncPipe,
  CurrencyPipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { combineLatest, debounceTime, map, Observable, of, tap } from 'rxjs';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import { CartState } from '@app/store/cart/cart.reducer';
import * as UserSelectors from '@store/user/user.selectors';
import * as CartSelectors from '@store/cart/cart.selectors';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// interfaces
import { IUser } from '@models/user.model';
import { ISupplementedCharge } from '@models/purchase.model';

// components
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { ReadonlyCartItemComponent } from './components/readonly-cart-item/readonly-cart-item.component';
import { userInformationContent } from '../../content/user-information.content';
import { FaqTabsComponent } from './components/faq-tabs/faq-tabs.component';
import { LatestPurchaseComponent } from './components/latest-purchase/latest-purchase.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-general',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    TitleCasePipe,
    UpperCasePipe,
    AccordionModule,
    BasicCardComponent,
    UserInfoComponent,
    ReadonlyCartItemComponent,
    LatestPurchaseComponent,
    FaqTabsComponent,
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly destroyRef = inject(DestroyRef);

  readonly userInformationItem = userInformationContent[0];

  user$: Observable<IUser | null> = of(null);
  cartState$: Observable<CartState> = of({} as CartState);
  latestTransaction$: Observable<ISupplementedCharge | undefined> =
    of(undefined);
  latestTransactionError$: Observable<string | null> = this.store.select(
    PurchaseSelectors.selectErrorMessage
  );

  generalLoading = false;

  ngOnInit(): void {
    this.initializeLoadingState();
    this.initializeDataStreams();
  }

  private initializeLoadingState(): void {
    this.generalLoading = true;
  }

  private initializeDataStreams(): void {
    combineLatest([
      this.store.select(UserSelectors.selectUser),
      this.store.select(CartSelectors.selectCartState),
      this.store
        .select(PurchaseSelectors.selectTransactions)
        .pipe(map((transactions) => transactions[0])),
    ])
      .pipe(
        debounceTime(2000),
        tap(() => (this.generalLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([user, cartState, latestTransaction]) => {
          this.user$ = of(user);
          this.cartState$ = of(cartState);
          this.latestTransaction$ = of(latestTransaction);
        },
        error: (error) => {
          console.error('Error loading general data:', error);
          this.generalLoading = false;
        },
      });
  }
}
