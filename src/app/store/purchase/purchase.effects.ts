import { inject, Injectable } from '@angular/core';
import { CheckoutService } from '@app/core/services/checkout.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';

@Injectable()
export class PurchaseEffects {
  private actions$ = inject(Actions);
  private checkoutService = inject(CheckoutService);

  getCurrentCustomer = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.getCustomer),
      exhaustMap(({ email }) =>
        this.checkoutService.getCustomer(email).pipe(
          map((customer) => {
            if (customer) {
              return PurchaseActions.getCustomerSuccess({ customer });
            } else {
              return PurchaseActions.getCustomerFailure({
                errorMessage: 'The user has not made any purchase',
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

  updateCustomer = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.updateCustomer),
      exhaustMap(({ customerId, updateMap }) =>
        this.checkoutService.updateCustomer(customerId, updateMap).pipe(
          map((customer) =>
            PurchaseActions.updateCustomerSuccess({ customer })
          ),
          catchError((error) =>
            of(
              PurchaseActions.updateCustomerFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );

  getAllTransactions = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseActions.getAllTransactions),
      exhaustMap(({ customerId }) =>
        this.checkoutService.getAllTransactions(customerId).pipe(
          map((transactions) =>
            PurchaseActions.getAllTransactionsSuccess({ transactions })
          ),
          catchError((error) =>
            of(
              PurchaseActions.getAllTransactionsFailure({
                errorMessage: error.message,
              })
            )
          )
        )
      )
    )
  );
}
