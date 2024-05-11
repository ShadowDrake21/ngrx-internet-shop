// angular stuff
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, from, map, mergeMap, Observable, of, switchMap } from 'rxjs';

// interfaces
import Stripe from 'stripe';
import {
  ICheckoutInit,
  IPurchaseUpdate,
  ISupplementedChargeProduct,
  ITransactionIds,
} from '@app/shared/models/purchase.model';
import {
  Database,
  get,
  orderByChild,
  query,
  Query,
  ref,
} from '@angular/fire/database';
import { equalTo } from 'firebase/database';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);
  private db = inject(Database);

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

  getTransactionInfoFromDB(
    customerId: string,
    searchValue: string
  ): Observable<ISupplementedChargeProduct[]> {
    const transactionProductsQuery = query(
      ref(this.db, `customers/${customerId}/purchases/`),
      orderByChild('payment_intent'),
      equalTo(searchValue)
    );

    return from(get(transactionProductsQuery)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.exists()) {
          return of([]);
        }

        const transactionIds: ITransactionIds[] = [];
        snapshot.forEach((childSnapshot) => {
          childSnapshot
            .val()
            .productsIds.forEach((productIds: ITransactionIds) =>
              transactionIds.push(productIds)
            );
        });

        const requests = transactionIds.map((ids) => {
          const { quantity } = ids;
          return forkJoin({
            product: this.getTransactionProduct(ids.product_id),
            price: this.getTransactionPrice(ids.price_id),
          }).pipe(
            map(({ product, price }) => ({
              product,
              price,
              quantity,
            }))
          );
        });

        return forkJoin(requests);
      })
    );
  }

  getTransactionProduct(productId: string): Observable<Stripe.Product> {
    return from(this.stripe.products.retrieve(productId)).pipe(
      map((product) => {
        return product as Stripe.Product;
      })
    );
  }

  getTransactionPrice(priceId: string): Observable<Stripe.Price> {
    return from(this.stripe.prices.retrieve(priceId)).pipe(
      map((price) => {
        return price as Stripe.Price;
      })
    );
  }
}
