// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  filter,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  faCartPlus,
  faHeartCircleMinus,
  faHeartCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CarouselModule } from 'ngx-bootstrap/carousel';

// components
import { SimilarProductComponent } from './components/similar-product/similar-product.component';

// interfaces
import { IProduct } from '../../shared/models/product.model';

// services
import { ProductService } from '../../core/services/product.service';

// pipes
import { SafeHTMLPipe } from '../../shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '../../shared/pipes/clear-url.pipe';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';

// created ngrx stuff
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/product/product.actions';
import * as CartActions from '../../store/cart/cart.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import * as CartSelectors from '../../store/cart/cart.selectors';
import * as FavoritesActions from '../../store/favorites/favorites.action';
import * as FavoritesSelectors from '../../store/favorites/favorites.selectors';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProductManipulationsService } from '@app/core/services/product-manipulations.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    SafeHTMLPipe,
    ClearURLPipe,
    TruncateTextPipe,
    FontAwesomeModule,
    RouterLink,
    SimilarProductComponent,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit, OnDestroy {
  cartAdd = faCartPlus;

  favoriteAdd = faHeartCirclePlus;
  favoriteRemove = faHeartCircleMinus;

  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private productManipulationsService = inject(ProductManipulationsService);

  productId$!: Observable<number>;
  product$!: Observable<IProduct>;
  subscriptions: Subscription[] = [];

  isInCart!: boolean;
  isInFavorites!: boolean;

  similarProducts$!: Observable<IProduct[]>;

  ngOnInit(): void {
    this.productId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => +params.get('id')!)
    ) as Observable<number>;

    const productSubscription: Subscription = this.productId$.subscribe(
      (productId) => {
        this.store.dispatch(
          ProductActions.loadSingleProductById({ productId })
        );

        this.store
          .select(ProductSelectors.selectProducts)
          .pipe(
            map((products) => products[0]),
            filter((product) => !!product),
            map((product) => {
              const updatedProduct = { ...product };
              updatedProduct.images = updatedProduct.images.map((image) =>
                this.productManipulationsService.normalizeImage(image)
              );

              return updatedProduct;
            })
          )
          .subscribe((product) => {
            this.product$ = of(product);
          });

        this.checkInCart(productId);
        this.checkIfInFavorites();
        // this.checkInFavorites(productId);

        this.similarProducts$ = this.productService.getAllProducts().pipe(
          map((products) => {
            const remainingProducts = products.filter(
              (product) => product.id !== productId
            );

            const similarProducts = remainingProducts.slice(0, 7);
            return similarProducts;
          })
        );
      }
    );

    this.subscriptions.push(productSubscription);
  }

  // finish!
  checkIfInFavorites() {
    const favoritesSubscription = this.store
      .select(FavoritesSelectors.selectFavorites)
      .pipe(
        switchMap((favorites: IProduct[]) =>
          this.product$.pipe(
            map((product) => ({ favorites, product })),
            map(({ favorites, product }) => {
              let findFavorite: IProduct | undefined = undefined;
              findFavorite = favorites.find(
                (favorite) => favorite.id === product.id
              );
              return {
                id: findFavorite?.favoriteId,
                isInFavorites: !!findFavorite,
              };
            })
          )
        )
      )
      .subscribe(({ id, isInFavorites }) => {
        if (isInFavorites) {
          this.product$
            .pipe(map((product) => (product.favoriteId = id)))
            .subscribe();
          console.log('Product is in favorites');
        } else {
          console.log('Product is NOT in favorites');
        }
      });

    this.subscriptions.push(favoritesSubscription);
  }

  onAddToCart(product: IProduct) {
    console.log('onAddToCart', product);
    this.store.dispatch(
      CartActions.addToCart({
        product,
      })
    );
    this.isInCart = true;
  }

  onToggleToFavourites(productId: number) {
    if (!this.isInFavorites) {
      const favoriteId = `favorite-product_${new Date().getTime()}`;
      this.store.dispatch(
        FavoritesActions.addToFavorites({
          productId,
          recordName: favoriteId,
        })
      );

      const errorMessageSubscription = this.store
        .select(FavoritesSelectors.selectErrorMessage)
        .pipe(
          filter((errorMessage) => !errorMessage),
          switchMap(() => this.product$),
          tap((product) => {
            const extendedProduct: IProduct = { ...product, favoriteId };
            product = extendedProduct;
          })
        )
        .subscribe();

      this.subscriptions.push(errorMessageSubscription);
    } else {
      const productSubscription = this.product$
        .pipe(
          take(1),
          switchMap((product) => {
            const favoriteId = product.favoriteId!;
            this.store.dispatch(
              FavoritesActions.removeFromFavorites({ favoriteId })
            );

            return this.product$.pipe(
              tap((product) => {
                product.favoriteId = '';
              })
            );
          })
        )
        .subscribe();

      this.subscriptions.push(productSubscription);
    }
    this.isInFavorites = !this.isInFavorites;
  }

  checkInCart(productId: number) {
    let cartProductsIds: number[] = [];

    const cartSubscription = this.store
      .select(CartSelectors.selectCartProducts)
      .pipe(map((products) => products.map((product) => product.id)))
      .subscribe((ids) => {
        cartProductsIds = ids;
      });

    this.isInCart = cartProductsIds.includes(productId);

    this.subscriptions.push(cartSubscription);
  }

  // checkInFavorites(productId: number) {
  //   let favoritesProductsIds: number[] = [];

  //   const favoritesSubscription = this.store
  //     .select(FavoritesSelectors.selectFavorites)
  //     .pipe(map((favorites) => favorites.map((favorite) => favorite)))
  //     .subscribe((ids) => {
  //       favoritesProductsIds = ids;
  //     });

  //   this.isInFavorites = favoritesProductsIds.includes(productId);

  //   this.subscriptions.push(favoritesSubscription);
  // }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
