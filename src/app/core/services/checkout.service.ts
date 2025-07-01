// angular stuff
import { HttpClient } from '@angular/common/http';
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
  tap,
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
import { environment } from 'environments/environment.development';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(Database);
  private readonly stripe: Stripe = new Stripe(environment.stripe.apiKey);
  private readonly baseUrl = `${CHECKOUT_BASE_URL}/checkout`;

  checkoutInit(data: ICheckoutInit): Observable<any> {
    const checkoutData = {
      items: data.products,
      email: data.email,
      deliveryAddress: data.deliveryAddress,
      paymentMethodId: data.paymentMethodId,
    };

    return this.http.post(this.baseUrl, checkoutData);
  }

  createCustomer(email: string): Observable<Stripe.Customer> {
    return this.stripeRequest<Stripe.Customer>(
      this.stripe.customers.create({ email })
    );
  }

  getCustomer(email: string): Observable<Stripe.Customer | null> {
    return this.stripeRequest<Stripe.ApiList<Stripe.Customer>>(
      this.stripe.customers.list({
        email,
        limit: 1,
      })
    ).pipe(map((result) => result.data?.[0] ?? null));
  }

  updateCustomer(
    customerId: string,
    updateObject: IPurchaseUpdate
  ): Observable<Stripe.Customer> {
    return this.stripeRequest<Stripe.Customer>(
      this.stripe.customers.update(customerId, updateObject)
    );
  }

  getAllTransactions(customerId: string): Observable<{
    charges: Stripe.Charge[];
  }> {
    return this.stripeRequest<Stripe.ApiList<Stripe.Charge>>(
      this.stripe.charges.list({
        customer: customerId,
        limit: 4,
      })
    ).pipe(
      map((result) => ({
        charges: result.data,
      }))
    );
  }

  getUserTransactionsDataFromDB(
    customerId: string
  ): Observable<IUserTransactionsData | null> {
    const transactionProductsQuery = query(
      ref(this.db, `customers/${customerId}/purchases/`)
    );

    return from(get(transactionProductsQuery)).pipe(
      map((snapshot) => {
        if (!snapshot.exists()) return null;

        let transactionsData: IUserTransactionsData = { count: 0, price: 0 };
        snapshot.forEach((childSnapshot) => {
          transactionsData = {
            count: transactionsData.count + 1,
            price: transactionsData.price + childSnapshot.val().total_price,
          };

          return false;
        });

        return transactionsData;
      })
    );
  }

  // TODO: Transaction articles bug
  getTransactionInfoFromDB(
    customerId: string,
    paymentIntentId: string
  ): Observable<ISupplementedChargeProduct[]> {
    const purchasesRef = ref(this.db, `customers/${customerId}/purchases`);
    const queryRef = query(purchasesRef, equalTo(paymentIntentId));

    return from(get(queryRef)).pipe(
      switchMap((snapshot) => {
        if (!snapshot.exists()) {
          return of([]);
        }

        let purchaseData: any = null;
        snapshot.forEach((childSnapshot) => {
          purchaseData = childSnapshot.val();
          return true;
        });

        if (!purchaseData?.productsIds) {
          return of([]);
        }

        return this.getSupplementedProducts(purchaseData.productsIds);
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  getTransactionProduct(productId: string): Observable<Stripe.Product> {
    return this.stripeRequest<Stripe.Product>(
      this.stripe.products.retrieve(productId)
    );
  }

  getTransactionPrice(priceId: string): Observable<Stripe.Price> {
    return this.stripeRequest<Stripe.Price>(
      this.stripe.prices.retrieve(priceId)
    );
  }

  createPaymentMethod(cardObj: ICard): Observable<string> {
    return this.createCardToken(cardObj).pipe(
      switchMap((token) => this.createStripePaymentMethod(token)),
      map((paymentMethod) => paymentMethod.id),
      catchError((error) => {
        throw new Error(`Payment method creation failed: ${error.message}`);
      })
    );
  }

  // ------------- HELPER METHODS ------------- //

  private getSupplementedProducts(
    transactionIds: ITransactionIds[]
  ): Observable<ISupplementedChargeProduct[]> {
    if (!transactionIds?.length) return of([]);

    const requests = transactionIds
      .filter(({ product_id, price_id }) => product_id && price_id)
      .map(({ product_id, price_id, quantity }) =>
        forkJoin({
          product: this.getTransactionProduct(product_id).pipe(
            catchError(() => of(null))
          ),
          price: this.getTransactionPrice(price_id).pipe(
            catchError(() => of(null))
          ),
        }).pipe(
          map(({ product, price }) => {
            if (!product || !price) return null;
            return { product, price, quantity } as ISupplementedChargeProduct;
          })
        )
      );

    return forkJoin(requests).pipe(
      map((results) => results.filter(Boolean) as ISupplementedChargeProduct[])
    );
  }

  private stripeRequest<T>(
    promise: Promise<T>
  ): Observable<Omit<T, 'lastResponse'>> {
    return from(promise).pipe(
      map((result) => {
        const { lastResponse, ...clearResult } = result as any;
        return clearResult as T;
      })
    );
  }

  private createCardToken({
    cardHolder,
    cardNumber,
    expirationMonth,
    expirationYear,
    cvc,
  }: ICard): Observable<Stripe.Token> {
    return this.stripeRequest<Stripe.Token>(
      this.stripe.tokens.create({
        card: {
          name: cardHolder,
          number: cardNumber,
          exp_month: expirationMonth,
          exp_year: expirationYear,
          cvc,
        },
      })
    );
  }

  private createStripePaymentMethod({
    id,
    card,
  }: Stripe.Token): Observable<Stripe.PaymentMethod> {
    return this.stripeRequest<Stripe.PaymentMethod>(
      this.stripe.paymentMethods.create({
        type: 'card',
        card: { token: id },
        billing_details: { name: card?.name },
      })
    );
  }
}
