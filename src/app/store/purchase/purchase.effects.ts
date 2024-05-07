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
              return PurchaseActions.getCustomerFailure({ errorMessage: '' });
            }
          }),
          catchError((error) =>
            of(PurchaseActions.getCustomerFailure({ errorMessage: '' }))
          )
        )
      )
    )
  );

  getAllTransactions = createEffect(() =>
    this.actions$.pipe(ofType(PurchaseActions.getAllTransactions))
  );
}
