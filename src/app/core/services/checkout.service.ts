// angular stuff
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import {
  Database,
  get,
  orderByChild,
  query,
  ref,
} from '@angular/fire/database';
import { equalTo } from 'firebase/database';
import Stripe from 'stripe';

// interfaces
import {
  ICheckoutInit,
  IPurchaseUpdate,
  ISupplementedChargeProduct,
  ITransactionIds,
  IUserTransactionsData,
} from '@models/purchase.model';
import { ICard } from '@models/card.model';
import { CHECKOUT_BASE_URL } from '../constants/checkout.constants';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);
  private db = inject(Database);

  stripe!: Stripe;

  constructor() {
    this.stripe = new Stripe(
      'sk_test_51OSDbAAGBN9qzN7ZebHv8tsmZYaQwHC0xDtAaZ3GAJJTJbO8DJpTGvLtaIMcJAsgCrW69d2W8Vx5E356Mw04dAqM00EkfSFmu1'
    );
  }

  checkoutInit(data: ICheckoutInit): Observable<any> {
    return this.http.post(`${CHECKOUT_BASE_URL}/checkout`, {
      items: data.products,
      email: data.email,
      deliveryAddress: data.deliveryAddress,
      paymentMethodId: data.paymentMethodId,
    });
  }

  createCustomer(email: string): Observable<Stripe.Customer> {
    return from(this.stripe.customers.create({ email })).pipe(
      map((customer) => {
        const { lastResponse, ...clearCustomer } = customer;
        return clearCustomer as Stripe.Customer;
      })
    );
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
          return of(result);
        }
      })
    );
  }

  updateCustomer(
    customerId: string,
    updateObject: IPurchaseUpdate
  ): Observable<Stripe.Customer> {
    return from(this.stripe.customers.update(customerId, updateObject)).pipe(
      map((updatedCustomer) => {
        const { lastResponse, ...clearUpdatedCustomer } = updatedCustomer;
        return clearUpdatedCustomer as Stripe.Customer;
      })
    );
  }

  getAllTransactions(customerId: string): Observable<{
    charges: Stripe.Charge[];
  }> {
    return from(
      this.stripe.charges.list({
        customer: customerId,
        limit: 4,
      })
    ).pipe(
      mergeMap((result) => {
        if ('data' in result) {
          return of({ charges: result.data });
        } else {
          return of({ charges: [] });
        }
      })
    );
  }

  getUserTransactionsDataFromDB(
    customerId: string
  ): Observable<IUserTransactionsData | null> {
    const transactionProductsQuery = query(
      ref(this.db, `customers/${customerId}/purchases/`)
    );

    return from(get(transactionProductsQuery)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.exists()) {
          return of(null);
        }

        let transactionsData: IUserTransactionsData = { count: 0, price: 0 };
        snapshot.forEach((childSnapshot) => {
          transactionsData = {
            count: transactionsData.count + 1,
            price: transactionsData.price + childSnapshot.val().total_price,
          };
        });

        return of(transactionsData);
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

  createPaymentMethod(cardObj: ICard): Observable<string> {
    return from(
      this.stripe.tokens.create({
        card: {
          name: cardObj.cardHolder,
          number: cardObj.cardNumber,
          exp_month: cardObj.expirationMonth,
          exp_year: cardObj.expirationYear,
          cvc: cardObj.cvc,
        },
      })
    ).pipe(
      switchMap((tokenResult) => {
        if (tokenResult.lastResponse.statusCode !== 200) {
          throw new Error(
            'Error creating token: ' + tokenResult.lastResponse.statusCode
          );
        }
        return from(
          this.stripe.paymentMethods.create({
            type: 'card',
            card: { token: tokenResult.id },
            billing_details: { name: tokenResult.card?.name },
          })
        );
      }),
      map((paymentMethodResult) => {
        if (paymentMethodResult.lastResponse.statusCode !== 200) {
          throw new Error(
            'Error creating payment method: ' +
              paymentMethodResult.lastResponse.statusCode
          );
        }
        return paymentMethodResult.id;
      }),
      catchError((error) => {
        throw new Error(error.message);
      })
    );
  }
}
