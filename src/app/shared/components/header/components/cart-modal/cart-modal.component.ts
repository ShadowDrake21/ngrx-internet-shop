import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IProduct } from '../../../../models/product.model';
import { Store } from '@ngrx/store';
import { CartState } from '../../../../../store/cart/cart.reducer';
import { Observable } from 'rxjs';

import * as CartActions from '../../../../../store/cart/cart.actions';
import * as CartSelectors from '../../../../../store/cart/cart.selectors';
import { ClearURLPipe } from '../../../../pipes/clear-url.pipe';
import { SafeHTMLPipe } from '../../../../pipes/safe-html.pipe';
import { TruncateTextPipe } from '../../../../pipes/truncate-text.pipe';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';

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
  private store = inject(Store<CartState>);
  private http = inject(HttpClient);
  private router = inject(Router);
  public bsModalRef = inject(BsModalRef);

  title?: string;
  closeBtnName?: string;
  class?: string;

  products$!: Observable<IProduct[]>;
  totalPrice$!: Observable<number>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsArr: IProduct[] = [];

  ngOnInit(): void {
    this.products$ = this.store.select(CartSelectors.selectCartProducts);
    this.totalPrice$ = this.store.select(CartSelectors.selectCartTotalPrice);
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

    this.http
      .post('http://localhost:4242/checkout', {
        items: this.cartProductsArr,
      })
      .subscribe(async (res: any) => {
        let stripe = await loadStripe(
          'pk_test_51OSDbAAGBN9qzN7Z82crr3YkNTsqfwb2wsrBREzDKe0qDVRYSyS9hzEPxv4ZE9aeqtfZyKvT8CVzqVGV0SkpwYAO004zou70Ro'
        );

        stripe?.redirectToCheckout({
          sessionId: res.id,
        });
      });
  }
}
