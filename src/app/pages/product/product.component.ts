import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { map, Observable, Subscription } from 'rxjs';
import { IProduct } from '../../shared/models/product.model';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import * as ProductActions from '../../store/product/product.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { SafeHTMLPipe } from '../../shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '../../shared/pipes/clear-url.pipe';
import { TruncateTextPipe } from '../../shared/pipes/truncate-text.pipe';
import {
  faCartPlus,
  faHeartCirclePlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProductService } from '../../core/services/product.service';
import { ProductsItemComponent } from '../products/components/products-item/products-item.component';
import { SingleSearchResultComponent } from '../search-results/components/single-search-result/single-search-result.component';
import { SimilarProductComponent } from './components/similar-product/similar-product.component';

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

  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  productId$!: Observable<number>;
  product$!: Observable<IProduct>;
  productSubscription!: Subscription;

  similarProducts$!: Observable<IProduct[]>;

  ngOnInit(): void {
    this.productId$ = this.route.paramMap.pipe(
      map((params: ParamMap) => +params.get('id')!)
    ) as Observable<number>;

    this.productSubscription = this.productId$.subscribe((productId) => {
      this.store.dispatch(ProductActions.getSingleProductById({ productId }));

      this.product$ = this.store
        .select(ProductSelectors.selectProducts)
        .pipe(map((products) => products[0]));

      this.similarProducts$ = this.productService.getAllProducts().pipe(
        map((products) => {
          const remainingProducts = products.filter(
            (product) => product.id !== productId
          );

          const similarProducts = remainingProducts.slice(0, 7);
          return similarProducts;
        })
      );

      this.similarProducts$.subscribe(console.log);
    });
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  ngOnDestroy(): void {
    this.productSubscription.unsubscribe();
  }
}
