// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Observable, of } from 'rxjs';

// services
import { ProductService } from '@core/services/product.service';

// components
import { ProductsCategorySliderItemComponent } from './components/products-category-slider-item/products-category-slider-item.component';
import { ProductsItemComponent } from '@shared/components/products-item/products-item.component';

// interfaces
import { ICategory } from '@models/category.model';
import { IProduct } from '@models/product.model';
import { customProducts } from '@app/shared/mocks/products.mocks';

@Component({
  selector: 'app-products-category-slider',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    ProductsItemComponent,
    ProductsCategorySliderItemComponent,
  ],
  templateUrl: './products-category-slider.component.html',
  styleUrl: './products-category-slider.component.scss',
})
export class ProductsCategorySliderComponent implements OnInit {
  private productService = inject(ProductService);

  @Input({ required: true, alias: 'categoryId' }) categoryIdStr!:
    | string
    | 'custom';

  category$!: Observable<ICategory | null>;
  products$!: Observable<IProduct[]>;

  itemsPerSlide: number = 4;
  singleSlideOffset = true;

  private innerWidth!: number;
  private mobileBreakpoint: number = 600;
  private tabletBreakpoint: number = 1000;
  private desktopBreakpoint: number = 1300;
  showIndicator: boolean = true;

  ngOnInit(): void {
    if (this.categoryIdStr === 'custom') {
      this.products$ = of(customProducts);
    } else {
      this.products$ = this.productService.getProductsByCategory(
        parseInt(this.categoryIdStr),
        {
          offset: 0,
          limit: 15,
        }
      );
    }
    this.adjustItemsPerSlide();
  }

  private adjustItemsPerSlide() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < this.mobileBreakpoint) {
      this.itemsPerSlide = 1;
      this.showIndicator = false;
    } else if (
      this.innerWidth >= this.mobileBreakpoint &&
      this.innerWidth < this.tabletBreakpoint
    ) {
      this.itemsPerSlide = 2;
    } else if (
      this.innerWidth >= this.tabletBreakpoint &&
      this.innerWidth < this.desktopBreakpoint
    ) {
      this.itemsPerSlide = 3;
    } else {
      this.itemsPerSlide = 4;
    }
  }
}
