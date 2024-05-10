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
import {
  ICheckoutInit,
  IPurchaseUpdate,
} from '@app/shared/models/purchase.model';

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

  checkoutInit(data: ICheckoutInit): Observable<any> {
    return this.http.post('http://localhost:4242/checkout', {
      items: data.products,
      email: data.email,
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
    updateObject: IPurchaseUpdate
  ): Observable<Stripe.Customer> {
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
