// angular stuff
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  delay,
  exhaustMap,
  forkJoin,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';
import { loadStripe, StripeError } from '@stripe/stripe-js';

// created ngrx stuff
import * as PurchaseActions from '@store/purchase/purchase.actions';

// services
import { CheckoutService } from '@core/services/checkout.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

@Injectable()
export class PurchaseEffects {
  private actions$ = inject(Actions);
  private store = inject(Store<AppState>);
  private checkoutService = inject(CheckoutService);

  initializeCheckout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseActions.initializeCheckout),
        exhaustMap(({ data }) => {
          this.store.dispatch(PurchaseActions.startCheckoutLoading());
          return this.checkoutService.checkoutInit(data).pipe(
            delay(10000),
            switchMap(async (res: any) => {
              const stripe = from(
                loadStripe(
                  'pk_test_51OSDbAAGBN9qzN7Z82crr3YkNTsqfwb2wsrBREzDKe0qDVRYSyS9hzEPxv4ZE9aeqtfZyKvT8CVzqVGV0SkpwYAO004zou70Ro'
                )
              );

              return stripe?.subscribe((stripeInit) =>
                stripeInit?.redirectToCheckout({
                  sessionId: res.id,
                })
              );
            }),
            catchError((error) => {
              return of(error);
            })
          );
        }),
        map(() => {
          this.store.dispatch(PurchaseActions.endCheckoutLoading());
        })
      ),
    { dispatch: false }
  );

  createCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.createCustomer),
      exhaustMap(({ email }) =>
        this.checkoutService.createCustomer(email).pipe(
          map((customer) => {
            sessionStorage.setItem('customer', JSON.stringify(customer));
            return PurchaseActions.createCustomerSuccess({ customer });
          }),
          catchError((error) =>
            of(
              PurchaseActions.createCustomerFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );

  getCurrentCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.getCustomer),
      exhaustMap(({ email }) =>
        this.checkoutService.getCustomer(email).pipe(
          map((customer) => {
            if (customer) {
              sessionStorage.setItem('customer', JSON.stringify(customer));
              return PurchaseActions.getCustomerSuccess({ customer });
            } else {
              return PurchaseActions.createCustomer({
                email,
              });
            }
          }),
          catchError((error) =>
            of(
              PurchaseActions.getCustomerFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );

  updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.updateCustomer),
      exhaustMap(({ customerId, updateObject }) => {
        {
          return this.checkoutService
            .updateCustomer(customerId, updateObject)
            .pipe(
              map((customer) => {
                sessionStorage.setItem('customer', JSON.stringify(customer));
                return PurchaseActions.updateCustomerSuccess({ customer });
              }),
              catchError((error: StripeError) =>
                of(
                  PurchaseActions.updateCustomerFailure({
                    errorMessage: error.message! ?? 'Error during user update!',
                  })
                )
              )
            );
        }
      })
    )
  );

  getAllTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.getAllTransactions),
      exhaustMap(({ customerId }) =>
        this.checkoutService.getAllTransactions(customerId).pipe(
          switchMap(({ charges }) =>
            forkJoin(
              charges.map((charge) =>
                this.checkoutService
                  .getTransactionInfoFromDB(
                    customerId,
                    charge.payment_intent as string
                  )
                  .pipe(
                    map((supplementedProducts) => ({
                      charge,
                      products: supplementedProducts,
                    }))
                  )
              )
            ).pipe(
              map((transactions) => {
                sessionStorage.setItem(
                  'transactions',
                  JSON.stringify(transactions)
                );
                return PurchaseActions.getAllTransactionsSuccess({
                  transactions,
                });
              }),
              catchError((error: StripeError) =>
                of(
                  PurchaseActions.getAllTransactionsFailure({
                    errorMessage:
                      `Error: ${error.message!}` ??
                      'Error during all transactions loading!',
                  })
                )
              )
            )
          ),
          catchError((error: StripeError) =>
            of(
              PurchaseActions.getAllTransactionsFailure({
                errorMessage:
                  `Error: ${error.message!}` ??
                  'Error during all transactions loading!',
              })
            )
          )
        )
      )
    )
  );
}
