// angular stuff
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// interfaces
import { IProduct } from '../../shared/models/product.model';
import Stripe from 'stripe';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private store = inject(Store<UserState>);
  private http = inject(HttpClient);

  stripe!: Stripe;
  email: string | null = null;
  customer!: Stripe.Customer;

  constructor() {
    this.stripe = new Stripe(
      'sk_test_51OSDbAAGBN9qzN7ZebHv8tsmZYaQwHC0xDtAaZ3GAJJTJbO8DJpTGvLtaIMcJAsgCrW69d2W8Vx5E356Mw04dAqM00EkfSFmu1'
    );

    this.store.select(UserSelectors.selectEmail).subscribe((email) => {
      this.email = email!;
      this.getCustomer();
    });
  }

  checkoutInit(products: IProduct[]): Observable<any> {
    return this.http.post('http://localhost:4242/checkout', {
      items: products,
      email: this.email,
    });
  }

  async getCustomer() {
    if (this.email) {
      try {
        const customers = await this.stripe.customers.list({
          email: this.email,
          limit: 1,
        });

        if (customers.data.length > 0) {
          this.customer = customers.data[0];
        }

        console.log('customers', this.customer);
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getAllTransactions() {
    if (this.customer) {
      const transactions = await this.stripe.charges.list({
        customer: this.customer.id,
      });
      console.log(transactions);
    } else {
      console.log('no customer');
    }
  }
}
