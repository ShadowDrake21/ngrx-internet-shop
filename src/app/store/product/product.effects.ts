import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';

// services
import { ProductService } from '../../core/services/product.service';

// actions
import * as ProductActions from '../../store/product/product.actions';

@Injectable()
export class ProductEffects {
  private actions$ = inject(Actions);
  private productService = inject(ProductService);
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      exhaustMap(() =>
        this.productService.getAllProducts().pipe(
          map((products) => ProductActions.loadProductsSuccess({ products })),
          catchError((error) =>
            of(
              ProductActions.loadProductsFailure({
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

  loadSingleProductById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadSingleProductById),
      exhaustMap((productId) =>
        this.productService.getSingleProductById(productId.productId).pipe(
          map((product) =>
            ProductActions.loadSingleProductByIdSuccess({ product })
          ),
          catchError((error) =>
            of(
              ProductActions.loadSingleProductByIdFailure({
                errorMessage: 'Error during product fetching!',
              })
            )
          )
        )
      )
    )
  );

  loadProductsByCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProductsByCategory),
      exhaustMap(({ categoryId }) =>
        this.productService.getProductsByCategory(categoryId).pipe(
          map((products) =>
            ProductActions.loadProductsByCategorySuccess({ products })
          ),
          catchError((error) =>
            of(
              ProductActions.loadProductsByCategoryFailure({
                errorMessage: 'Error during the products loading!',
              })
            )
          )
        )
      )
    )
  );
}
