// angular stuff
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, mergeMap, Observable, of } from 'rxjs';

// interfaces
import { IProduct } from '../../shared/models/product.model';
import Stripe from 'stripe';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);

  stripe!: Stripe;
  email: string | null = null;
  customer!: Stripe.Customer;

  constructor() {
    this.stripe = new Stripe(
      'sk_test_51OSDbAAGBN9qzN7ZebHv8tsmZYaQwHC0xDtAaZ3GAJJTJbO8DJpTGvLtaIMcJAsgCrW69d2W8Vx5E356Mw04dAqM00EkfSFmu1'
    );
  }

  // niezrobione
  checkoutInit(products: IProduct[]): Observable<any> {
    return this.http.post('http://localhost:4242/checkout', {
      items: products,
      email: this.email,
    });
  }

  getCustomer(email: string): Observable<Stripe.Customer | null> {
    return from(
      this.stripe.customers.list({
        email,
        limit: 1,
      })
    ).pipe(
      mergeMap((result) => {
        if ('data' in result) {
          return result.data.length > 0 ? of(result.data[0]) : of(null);
        } else {
          return of(result); //????
        }
      })
    );
  }

  updateCustomer(
    customerId: string,
    updateMap: Map<string, string>
  ): Observable<Stripe.Customer> {
    const updateObject: { [key: string]: string } = {};
    updateMap.forEach((value, key) => {
      updateObject[key] = value;
    });
    // lastResponse???
    return from(this.stripe.customers.update(customerId, updateObject));
  }

  // by default - 10 items, so I must adjust limit functionality
  getAllTransactions(customerId: string): Observable<Stripe.Charge[]> {
    return from(
      this.stripe.charges.list({
        customer: customerId,
      })
    ).pipe(
      mergeMap((result) => {
        if ('data' in result) {
          return of(result.data);
        } else {
          return of([]);
        }
      })
    );
  }
}
