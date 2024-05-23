import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  BsModalRef,
  BsModalService,
  ModalDirective,
  ModalModule,
} from 'ngx-bootstrap/modal';
import { IProduct } from '../../../../models/product.model';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import * as CartActions from '../../../../../store/cart/cart.actions';
import * as CartSelectors from '../../../../../store/cart/cart.selectors';
import * as UserSelectors from '../../../../../store/user/user.selectors';
import * as PurchaseActions from '../../../../../store/purchase/purchase.actions';
import * as PurchaseSelectors from '../../../../../store/purchase/purchase.selectors';
import { ClearURLPipe } from '../../../../pipes/clear-url.pipe';
import { SafeHTMLPipe } from '../../../../pipes/safe-html.pipe';
import { TruncateTextPipe } from '../../../../pipes/truncate-text.pipe';
import { RouterLink } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutService } from '../../../../../core/services/checkout.service';
import { AppState } from '../../../../../store/app.state';
import { IUser } from '../../../../models/user.model';
import { DatabaseService } from '@app/core/services/database.service';
import Stripe from 'stripe';
import { IShipping } from '@app/shared/models/purchase.model';
import { ICard } from '@app/shared/models/card.model';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [
    CommonModule,
    ClearURLPipe,
    SafeHTMLPipe,
    TruncateTextPipe,
    RouterLink,
    ModalModule,
  ],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.scss',
})
export class CartModalComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private databaseService = inject(DatabaseService);
  public bsModalRef = inject(BsModalRef);

  @ViewChild('autoShownChoosingModal', { static: false })
  autoShownChoosingModal?: ModalDirective;
  isAutoModalShown = false;

  title?: string;
  closeBtnName?: string;

  products$!: Observable<IProduct[]>;
  totalPrice$!: Observable<number>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsArr: IProduct[] = [];

  user$!: Observable<IUser | null>;

  userDeliveryAddresses$!: Observable<IShipping[]>;
  userCreditCards$!: Observable<ICard[]>;

  private userShippingDataSubscription!: Subscription;

  ngOnInit(): void {
    this.products$ = this.store.select(CartSelectors.selectCartProducts);
    this.totalPrice$ = this.store.select(CartSelectors.selectCartTotalPrice);
    this.user$ = this.store.select(UserSelectors.selectUser);
  }

  onIncreaseQuantity(productId: number) {
    this.store.dispatch(CartActions.increaseCountProduct({ productId }));
  }

  onDecreaseQuantity(productId: number) {
    this.store.dispatch(CartActions.decreaseCountProduct({ productId }));
  }

  onRemoveProduct(productId: number) {
    this.store.dispatch(CartActions.removeProductFromCart({ productId }));
  }

  onGoToCheckout() {
    this.choosePreviouslyAddedData();
    this.showAutoModal();

    // this.bsModalRef.hide();

    // this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    // this.cartProducts$.subscribe((products) => {
    //   this.cartProductsArr = products;
    // });

    // this.user$.subscribe((user) => {
    //   this.store.dispatch(
    //     PurchaseActions.initializeCheckout({
    //       data: {
    //         email: user?.userCredential?.providerData[0].email!,
    //         products: this.cartProductsArr!,
    //       },
    //     })
    //   );
    // });
  }

  showAutoModal(): void {
    this.isAutoModalShown = true;
  }

  hideAutoModal(): void {
    this.autoShownChoosingModal?.hide();
  }

  onHidden(): void {
    this.isAutoModalShown = false;
  }

  choosePreviouslyAddedData() {
    const userShippingDataSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        tap((customer) => console.log('customer', customer)),
        filter((customer): customer is Stripe.Customer => !!customer),
        switchMap((customer: Stripe.Customer) => {
          console.log('inside of switchMap');
          return combineLatest([
            this.databaseService.getAllDeliveryRecords(customer.id),
            this.databaseService.getAllCards(customer.id),
          ]).pipe(
            map(([addresses, cards]) => {
              console.log(
                'inside of choosePreviouslyAddedData',
                addresses,
                cards
              );
              this.userDeliveryAddresses$ = of(addresses);
              this.userCreditCards$ = of(cards);
            })
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.userShippingDataSubscription.unsubscribe();
  }
}
