import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CategoryService } from '@app/core/services/category.service';
import { ProductService } from '@app/core/services/product.service';
import { ProductsItemComponent } from '@app/shared/components/products-item/products-item.component';
import { ICategory } from '@app/shared/models/category.model';
import { IProduct } from '@app/shared/models/product.model';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Observable } from 'rxjs';
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
  private categoryService = inject(CategoryService);

  @Input({ required: true }) categoryName!: string;

  category$!: Observable<ICategory | null>;
  products$!: Observable<IProduct[]>;

  itemsPerSlide: number = 4;
  singleSlideOffset = true;

  ngOnInit(): void {
    this.category$ = this.categoryService.getCategoryByName(this.categoryName);
    this.category$.subscribe((category) => {
      this.products$ = this.productService.getProductsByCategory(
        category?.id!,
        { offset: 0, limit: 15 }
      );
    });
  }
}
