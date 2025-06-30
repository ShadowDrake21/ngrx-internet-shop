// angular stuff
import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {
  debounceTime,
  fromEvent,
  Observable,
  of,
  Subject,
  takeUntil,
} from 'rxjs';

// services
import { ProductService } from '@core/services/product.service';

// components
import { ProductsCategorySliderItemComponent } from './components/products-category-slider-item/products-category-slider-item.component';

// interfaces
import { IProduct } from '@models/product.model';
import { customProducts } from '@app/shared/mocks/products.mocks';

const RESPONSIVE_BREAKPOINTS = {
  MOBILE: 600,
  TABLET: 1000,
  DESKTOP: 1300,
} as const;

@Component({
  selector: 'app-products-category-slider',
  imports: [AsyncPipe, CarouselModule, ProductsCategorySliderItemComponent],
  templateUrl: './products-category-slider.component.html',
  styleUrl: './products-category-slider.component.scss',
})
export class ProductsCategorySliderComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true, alias: 'categoryId' })
  categoryId!: string | 'custom';

  products$!: Observable<IProduct[]>;
  itemsPerSlide: number = 4;
  singleSlideOffset = true;
  showIndicator: boolean = true;

  ngOnInit(): void {
    this.loadProducts();
    this.setupResponsiveBehavior();
  }

  private loadProducts(): void {
    this.products$ =
      this.categoryId === 'custom'
        ? of(customProducts)
        : this.productService.getProductsByCategory(parseInt(this.categoryId), {
            offset: 0,
            limit: 15,
          });
  }

  private setupResponsiveBehavior() {
    this.adjustItemsPerSlide(window.innerWidth);
    fromEvent(window, 'resize')
      .pipe(debounceTime(100), takeUntil(this.destroy$))
      .subscribe(() => {
        this.adjustItemsPerSlide(window.innerWidth);
      });
  }

  private adjustItemsPerSlide(width: number) {
    if (width < RESPONSIVE_BREAKPOINTS.MOBILE) {
      this.itemsPerSlide = 1;
      this.showIndicator = false;
    } else if (width < RESPONSIVE_BREAKPOINTS.TABLET) {
      this.itemsPerSlide = 2;
      this.showIndicator = true;
    } else if (width < RESPONSIVE_BREAKPOINTS.DESKTOP) {
      this.itemsPerSlide = 3;
    } else {
      this.itemsPerSlide = 4;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
