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
  private router = inject(Router);
  public bsModalRef = inject(BsModalRef);

  title?: string;
  closeBtnName?: string;
  class?: string;

  products$!: Observable<IProduct[]>;
  totalPrice$!: Observable<number>;

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
    this.router.navigate(['/checkout']);
  }
}
