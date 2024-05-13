import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { Store } from '@ngrx/store';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { map, Observable } from 'rxjs';

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
import { CarouselModule } from 'ngx-bootstrap/carousel';
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
  latestTransaction$!: Observable<ISupplementedCharge>;

  ngOnInit(): void {
    this.user$ = this.store.select(UserSelectors.selectUser);
    this.cartState$ = this.store.select(CartSelectors.selectCartState);
    this.latestTransaction$ = this.store
      .select(PurchaseSelectors.selectTransactions)
      .pipe(map((transactions) => transactions[0]));
  }
}
