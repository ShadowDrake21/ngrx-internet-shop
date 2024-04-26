import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IProduct } from '../../../../models/product.model';
import { Store } from '@ngrx/store';
import { Observable, switchMap } from 'rxjs';

import * as CartActions from '../../../../../store/cart/cart.actions';
import * as CartSelectors from '../../../../../store/cart/cart.selectors';
import * as UserSelectors from '../../../../../store/user/user.selectors';
import { ClearURLPipe } from '../../../../pipes/clear-url.pipe';
import { SafeHTMLPipe } from '../../../../pipes/safe-html.pipe';
import { TruncateTextPipe } from '../../../../pipes/truncate-text.pipe';
import { RouterLink } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutService } from '../../../../../core/services/checkout.service';
import { AppState } from '../../../../../store/app.state';
import { IUser } from '../../../../models/user.model';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [
    CommonModule,
    ClearURLPipe,
    SafeHTMLPipe,
    TruncateTextPipe,
    RouterLink,
  ],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.scss',
})
export class CartModalComponent implements OnInit {
  private store = inject(Store<AppState>);
  private checkoutService = inject(CheckoutService);
  public bsModalRef = inject(BsModalRef);

  title?: string;
  closeBtnName?: string;

  products$!: Observable<IProduct[]>;
  totalPrice$!: Observable<number>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsArr: IProduct[] = [];

  user$!: Observable<IUser | null>;

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
    this.bsModalRef.hide();

    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.cartProducts$.subscribe((products) => {
      this.cartProductsArr = products;
    });

    this.checkoutService
      .checkoutInit(this.cartProductsArr)
      .pipe(
        switchMap((res: any) => {
          const stripe = loadStripe(
            'pk_test_51OSDbAAGBN9qzN7Z82crr3YkNTsqfwb2wsrBREzDKe0qDVRYSyS9hzEPxv4ZE9aeqtfZyKvT8CVzqVGV0SkpwYAO004zou70Ro'
          );

          return stripe.then((stripeInit) => {
            return stripeInit?.redirectToCheckout({
              sessionId: res.id,
            });
          });
        })
      )
      .subscribe();
  }
}
