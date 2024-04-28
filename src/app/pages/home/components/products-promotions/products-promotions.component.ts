import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@app/core/authentication/auth.service';
import { ProductService } from '@app/core/services/product.service';
import { ProductsItemComponent } from '@app/shared/components/products-item/products-item.component';
import { IProduct } from '@app/shared/models/product.model';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-products-promotions',
  standalone: true,
  imports: [CommonModule, ProductsItemComponent],
  templateUrl: './products-promotions.component.html',
  styleUrl: './products-promotions.component.scss',
})
export class ProductsPromotionsComponent implements OnInit {
  private productService = inject(ProductService);

  allProducts$!: Observable<IProduct[]>;
  canBeInterestingProduct!: IProduct;
  productOfTheDay!: IProduct;

  ngOnInit(): void {
    this.allProducts$ = this.productService.getAllProducts().pipe(
      tap(
        (products) =>
          (this.canBeInterestingProduct = this.getRandomProduct(products))
      ),
      tap((products) => this.productOfTheDayManipulations(products))
    );

    this.allProducts$.subscribe();
  }

  // refactor!!!
  productOfTheDayManipulations(products: IProduct[]) {
    const productOfTheDayStr = localStorage.getItem('productOfTheDay');

    if (productOfTheDayStr) {
      this.productOfTheDay = JSON.parse(productOfTheDayStr) as IProduct;
      if (this.productOfTheDay.expirationTime! <= new Date().toUTCString()) {
        this.setNewProductOfTheDay(products);
      }
    } else {
      this.setNewProductOfTheDay(products);
    }
  }

  setNewProductOfTheDay(products: IProduct[]) {
    this.productOfTheDay = this.getRandomProduct(products);

    const date = new Date();
    date.setDate(date.getDate() + 1), date.setUTCHours(0, 0, 0, 0);
    this.productOfTheDay.expirationTime = date.toUTCString();
    localStorage.setItem(
      'productOfTheDay',
      JSON.stringify(this.productOfTheDay)
    );
  }

  getRandomProduct(products: IProduct[]) {
    return products[Math.floor(Math.random() * products.length)];
  }
}
