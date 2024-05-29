import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';

// services
import { ProductService } from '@core/services/product.service';

// interfaces
import { IProduct } from '@models/product.model';

// components
import { ProductsItemComponent } from '@shared/components/products-item/products-item.component';

@Component({
  selector: 'app-products-promotions',
  standalone: true,
  imports: [CommonModule, ProductsItemComponent],
  templateUrl: './products-promotions.component.html',
  styleUrl: './products-promotions.component.scss',
})
export class ProductsPromotionsComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  allProducts$!: Observable<IProduct[]>;

  canBeInterestingProduct!: IProduct;
  productOfTheDay!: IProduct;
  theMostExpensiveProduct!: IProduct;

  private allProductsSubscription!: Subscription;

  ngOnInit(): void {
    this.allProducts$ = this.productService.getAllProducts().pipe(
      tap(
        (products) =>
          (this.canBeInterestingProduct = this.getRandomProduct(products))
      ),
      tap(
        (products) =>
          (this.theMostExpensiveProduct =
            this.getTheMostExpesiveProduct(products))
      ),
      tap((products) => this.productOfTheDayManipulations(products))
    );

    this.allProductsSubscription = this.allProducts$.subscribe();
  }

  productOfTheDayManipulations(products: IProduct[]) {
    const productOfTheDayStr = localStorage.getItem('productOfTheDay');

    if (!productOfTheDayStr || this.checkProductOfTheDayExpired()) {
      this.setNewProductOfTheDay(products);
    } else {
      this.productOfTheDay = JSON.parse(productOfTheDayStr) as IProduct;
    }
  }

  setNewProductOfTheDay(products: IProduct[]) {
    this.productOfTheDay = this.getRandomProduct(products);
    this.productOfTheDay.expirationTime = this.calculateNextDay();
    localStorage.setItem(
      'productOfTheDay',
      JSON.stringify(this.productOfTheDay)
    );
  }

  checkProductOfTheDayExpired(): boolean {
    const productOfTheDayStr = localStorage.getItem('productOfTheDay');

    if (!productOfTheDayStr) {
      return true;
    }

    const productOfTheDay = JSON.parse(productOfTheDayStr) as IProduct;
    return new Date(productOfTheDay.expirationTime!) <= new Date();
  }

  calculateNextDay(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setUTCHours(0, 0, 0, 0);
    return date.toUTCString();
  }

  getRandomProduct(products: IProduct[]) {
    return products[Math.floor(Math.random() * products.length)];
  }

  getTheMostExpesiveProduct(products: IProduct[]): IProduct {
    const productsDesc: IProduct[] = products.sort(
      (productA, productB) => productB.price - productA.price
    );

    return productsDesc[0];
  }

  ngOnDestroy(): void {
    this.allProductsSubscription.unsubscribe();
  }
}
