// angular stuff
import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
import {
  ActivatedRoute,
  ParamMap,
  Params,
  Router,
  RouterLink,
} from '@angular/router';
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
import * as UserSelectors from '@store/user/user.selectors';
import * as ProductActions from '@store/product/product.actions';
import * as CartActions from '@store/cart/cart.actions';
import * as ProductSelectors from '@store/product/product.selectors';
import * as CartSelectors from '@store/cart/cart.selectors';
import * as FavoritesActions from '@app/store/favorites/favorites.actions';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import { ProductManipulationsService } from '@app/core/services/product-manipulations.service';
import { DatabaseService } from '@app/core/services/database.service';

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
  private router = inject(Router);
  private productService = inject(ProductService);
  private productManipulationsService = inject(ProductManipulationsService);
  private databaseService = inject(DatabaseService);

  source$!: Observable<'database' | 'api'>;
  productId$!: Observable<number | string>;
  product$!: Observable<IProduct | null>;
  similarProducts$!: Observable<IProduct[]>;

  isInCart: boolean = false;
  isInFavorites: boolean = false;
  isAuthorizedGuest: boolean = true;
  isProductOfTheDay: boolean = false;

  itemsPerSlide: number = 2;
  private innerWidth!: number;
  private mobileBreakpoint: number = 600;

  subscriptions: Subscription[] = [];

  getUrlParts() {
    this.source$ = this.route.queryParams.pipe(
      map((queries: Params) => {
        return queries['source'];
      })
    );

    this.productId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => params.get('id')!)
    );
  }

  loadAPIProductById() {
    const productSubscription: Subscription = this.productId$.subscribe(
      (productId) => {
        const productOfTheDay: IProduct | null = this.loadProductOfTheDay();
        if (Number(productId) !== this.loadProductOfTheDay()?.id) {
          this.isProductOfTheDay = false;
          this.store.dispatch(
            ProductActions.loadSingleProductById({
              productId: productId as number,
            })
          );
        } else {
          if (productOfTheDay) {
            this.isProductOfTheDay = true;
            this.store.dispatch(
              ProductActions.setSingleProduct({ product: productOfTheDay })
            );
          }
        }
      }
    );
    this.subscriptions.push(productSubscription);
  }

  loadProductOfTheDay(): IProduct | null {
    const productStr = localStorage.getItem('productOfTheDay');
    const product: IProduct | null = productStr
      ? (JSON.parse(productStr) as IProduct)
      : null;

    return product;
  }

  loadDatabaseProductById() {
    const databaseSubscription = this.store
      .select(UserSelectors.selectEmail)
      .pipe(
        switchMap((email) =>
          this.productId$.pipe(map((id) => ({ email, id })))
        ),
        switchMap(({ email, id }) =>
          this.databaseService.searchFavoriteProduct(email!, id as string)
        )
      )
      .subscribe((product) => {
        if (product) {
          this.store.dispatch(
            ProductActions.setSingleProduct({ product: product! })
          );
        }
      });
    this.subscriptions.push(databaseSubscription);
  }

  ngOnInit(): void {
    this.getUrlParts();

    const sourceSubscription = this.source$.subscribe((source) => {
      if (source) {
        if (source === 'api') {
          this.loadAPIProductById();
        } else if (source === 'database') {
          this.loadDatabaseProductById();
        }
      }
    });

    const productInitializationSubscription = this.productId$
      .pipe(
        switchMap((productId) => {
          return this.store
            .select(ProductSelectors.selectProducts)
            .pipe(
              map((products) => ({ productId, productsCount: products.length }))
            );
        })
      )
      .subscribe(({ productId, productsCount }) => {
        if (productId && productsCount === 1) {
          this.productInitialization(productId);
        }
      });

    this.checkInCart();
    this.adjustItemsPerSlide();

    this.subscriptions.push(
      sourceSubscription,
      productInitializationSubscription
    );
  }

  productInitialization(productId: string | number) {
    const selectProductSubscription = this.store
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
        }),
        switchMap((product) =>
          this.store
            .select(UserSelectors.selectEmail)
            .pipe(map((email) => ({ product, email })))
        )
      )
      .subscribe(({ product, email }) => {
        this.product$ = of(product);
        this.isAuthorizedGuest = !!email;
        if (email) {
          this.checkIfInFavorites();
          this.databaseService.setLastViewedProduct(email!, product.title);
        }
      });

    this.subscriptions.push(selectProductSubscription);

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

  checkIfInFavorites() {
    const favoritesSubscription = this.store
      .select(FavoritesSelectors.selectFavorites)
      .pipe(
        switchMap((favorites: IProduct[]) =>
          this.product$.pipe(
            map((product) => ({ favorites, product })),
            map(({ favorites, product }) => {
              let findFavorite: IProduct | undefined = favorites.find(
                (favorite) => favorite.id === product!.id
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
          const productSubscription = this.product$
            .pipe(
              take(1),
              map((product) => {
                if (product) {
                  const updateProduct = { ...product, favoriteId: id };
                  this.product$ = of(updateProduct);
                }
              })
            )
            .subscribe();

          this.isInFavorites = true;

          this.subscriptions.push(productSubscription);
        } else {
          const sourceSubscription = this.source$.subscribe((source) => {
            if (source === 'database') {
              if (!this.isInFavorites) {
                this.product$ = of(null);
                this.router.navigate(['/user-information/favorite-products']);
              }
            }
            this.isInFavorites = false;
          });

          this.subscriptions.push(sourceSubscription);
        }
      });

    this.subscriptions.push(favoritesSubscription);
  }

  onAddToCart(product: IProduct) {
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
            const extendedProduct: IProduct = { ...product!, favoriteId };
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
            if (product) {
              const favoriteId = product!.favoriteId!;
              this.store.dispatch(
                FavoritesActions.removeFromFavorites({ favoriteId })
              );

              const updatedProduct: IProduct = { ...product, favoriteId: '' };
              return of(updatedProduct);
            }
            return of(null);
          }),
          tap((product) => {
            if (product) {
              this.product$ = of(product);
            }
          })
        )
        .subscribe();
      this.isInFavorites = !this.isInFavorites;

      this.subscriptions.push(productSubscription);
    }
  }
  checkInCart() {
    const cartSubscription = this.productId$
      .pipe(
        switchMap((productId) =>
          this.store.select(CartSelectors.selectCartProducts).pipe(
            map((products) => products.map((product) => product.id)),
            map((cartProductsIds) =>
              cartProductsIds.includes(Number(productId))
            )
          )
        )
      )
      .subscribe((isInCart) => {
        this.isInCart = isInCart;
      });

    this.subscriptions.push(cartSubscription);
  }

  private adjustItemsPerSlide() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < this.mobileBreakpoint) {
      this.itemsPerSlide = 1;
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(ProductActions.clearProductState());
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
