import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from '../../core/services/product.service';

import * as ProductActions from '../../store/product/product.actions';
import { catchError, exhaustMap, map, of } from 'rxjs';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProduct),
      exhaustMap(() =>
        this.productService.getProducts().pipe(
          map((products) => ProductActions.loadProductSuccess({ products })),
          catchError((error) =>
            of(
              ProductActions.loadProductFailure({
                errorMessage: 'Error during the products loading!',
              })
            )
          )
        )
      )
    )
  );
}
