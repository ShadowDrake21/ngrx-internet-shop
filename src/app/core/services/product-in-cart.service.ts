import { inject, Injectable } from '@angular/core';
import { IProduct } from '@app/shared/models/product.model';
import { AppState } from '@app/store/app.state';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import * as CartSelectors from '@store/cart/cart.selectors';

@Injectable({
  providedIn: 'root',
})
export class ProductInCartService {
  private readonly store = inject(Store<AppState>);

  private readonly cartProductsIdxs$: Observable<number[]> = this.store
    .select(CartSelectors.selectCartProducts)
    .pipe(map((products) => products.map((product) => product.id)));

  isProductInCart(productId: number): Observable<boolean> {
    return this.cartProductsIdxs$.pipe(map((idxs) => idxs.includes(productId)));
  }
}
