import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CategoryService } from '@app/core/services/category.service';
import { ProductService } from '@app/core/services/product.service';
import { ProductsItemComponent } from '@app/shared/components/products-item/products-item.component';
import { ICategory } from '@app/shared/models/category.model';
import { IProduct } from '@app/shared/models/product.model';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Observable, tap } from 'rxjs';
import { ProductsCategorySliderItemComponent } from './components/products-category-slider-item/products-category-slider-item.component';

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

  @Input({ required: true, alias: 'categoryId' }) categoryIdStr!: string;

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
    this.products$ = this.productService.getProductsByCategory(
      parseInt(this.categoryIdStr),
      {
        offset: 0,
        limit: 15,
      }
    );

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
