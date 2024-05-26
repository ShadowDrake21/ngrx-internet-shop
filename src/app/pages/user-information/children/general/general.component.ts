import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { Store } from '@ngrx/store';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { combineLatest, debounceTime, map, Observable, of, tap } from 'rxjs';

import * as UserSelectors from '@store/user/user.selectors';
import * as CartSelectors from '@store/cart/cart.selectors';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { AppState } from '@app/store/app.state';
import { CartState } from '@app/store/cart/cart.reducer';
import { ClearURLPipe } from '@app/shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@app/shared/pipes/safe-html.pipe';
import { ReadonlyCartItemComponent } from './components/readonly-cart-item/readonly-cart-item.component';
import { userInformationContent } from '../../content/user-information.content';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';
import { FaqTabsComponent } from './components/faq-tabs/faq-tabs.component';
import { LatestPurchaseComponent } from './components/latest-purchase/latest-purchase.component';
import { UserInfoComponent } from './components/user-info/user-info.component';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    TruncateTextPipe,
    BasicCardComponent,
    ClearURLPipe,
    SafeHTMLPipe,
    UserInfoComponent,
    ReadonlyCartItemComponent,
    LatestPurchaseComponent,
    FaqTabsComponent,
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnInit {
  userInformationItem = userInformationContent[0];

  private store = inject(Store<AppState>);

  user$!: Observable<IUser | null>;
  cartState$!: Observable<CartState>;
  latestTransaction$!: Observable<ISupplementedCharge | undefined>;

  latestTransactionError$!: Observable<string | null>;

  generalLoading: boolean = false;

  ngOnInit(): void {
    this.generalLoading = true;

    this.latestTransactionError$ = this.store.select(
      PurchaseSelectors.selectErrorMessage
    );

    combineLatest([
      this.store.select(UserSelectors.selectUser),
      this.store.select(CartSelectors.selectCartState),
      this.store
        .select(PurchaseSelectors.selectTransactions)
        .pipe(map((transactions) => transactions[0])),
    ])
      .pipe(
        debounceTime(2000),
        tap(() => (this.generalLoading = false))
      )
      .subscribe({
        next: ([user, cartState, latestTransaction]) => {
          this.user$ = of(user);
          this.cartState$ = of(cartState);
          this.latestTransaction$ = of(latestTransaction);
        },
      });
  }
}
