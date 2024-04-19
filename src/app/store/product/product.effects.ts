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
        this.productService.getAllProducts().pipe(
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

  filterProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.filterProducts),
      exhaustMap((filterData) =>
        this.productService.getFilteredProducts(filterData.filterData).pipe(
          map((products) => ProductActions.filterProductsSuccess({ products })),
          catchError((error) =>
            of(
              ProductActions.filterProductsFailure({
                errorMessage: 'Error during the products filtration!',
              })
            )
          )
        )
      )
    )
  );

  searchProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.searchProducts),
      exhaustMap((searchTerm) =>
        this.productService.getProductsByTitle(searchTerm.searchTerm).pipe(
          map((products) => ProductActions.searchProductsSuccess({ products })),
          catchError((error) =>
            of(
              ProductActions.searchProductsFailure({
                errorMessage: 'Error during products search!',
              })
            )
          )
        )
      )
    )
  );

  getSingleProductById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.getSingleProductById),
      exhaustMap((productId) =>
        this.productService.getSingleProductById(productId.productId).pipe(
          map((product) =>
            ProductActions.getSingleProductByIdSuccess({ product })
          ),
          catchError((error) =>
            of(
              ProductActions.getSingleProductByIdFailure({
                errorMessage: 'Error during product fetching!',
              })
            )
          )
        )
      )
    )
  );
}
