import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadStripe } from '@stripe/stripe-js';
import { from, Observable, tap } from 'rxjs';
import { CartState } from '../../store/cart/cart.reducer';
import { IProduct } from '../../shared/models/product.model';
import * as CartSelectors from '../../store/cart/cart.selectors';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private store = inject(Store<CartState>);
  private http = inject(HttpClient);

  cartProducts$!: Observable<IProduct[]>;
  cartProductsArr: IProduct[] = [];

  ngOnInit(): void {
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
