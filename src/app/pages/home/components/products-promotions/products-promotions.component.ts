import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription, tap } from 'rxjs';

// services
import { ProductService } from '@core/services/product.service';

// interfaces
import { IProduct } from '@models/product.model';

// components
import { ProductsItemComponent } from '@shared/components/products-item/products-item.component';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';

import * as CartActions from '@store/cart/cart.actions';
import * as CartSelectors from '@store/cart/cart.selectors';
import { AsyncPipe } from '@angular/common';
import { ProductInCartService } from '@app/core/services/product-in-cart.service';
import { ProductInCartPipe } from '@app/shared/pipes/product-in-cart.pipe';

const PRODUCT_OF_THE_DAY_KEY = 'productOfTheDay';

@Component({
  selector: 'app-products-promotions',
  imports: [AsyncPipe, ProductsItemComponent, ProductInCartPipe],
  templateUrl: './products-promotions.component.html',
  styleUrl: './products-promotions.component.scss',
})
export class ProductsPromotionsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store<AppState>);
  private readonly productService = inject(ProductService);
  private allProductsSubscription = new Subscription();

  canBeInterestingProduct!: IProduct;
  productOfTheDay!: IProduct;
  theMostExpensiveProduct!: IProduct;

  ngOnInit(): void {
    this.initializeProducts();
  }

  private initializeProducts(): void {
    this.allProductsSubscription.add(
      this.productService
        .getAllProducts()
        .pipe(
          tap((products) => {
            this.canBeInterestingProduct = this.getRandomProduct(products);
            this.theMostExpensiveProduct =
              this.getTheMostExpesiveProduct(products);
            this.handleProductOfTheDay(products);
          })
        )
        .subscribe()
    );
  }

  private handleProductOfTheDay(products: IProduct[]): void {
    const storedProduct = this.getStoredProductOfTheDay();

    if (!storedProduct || this.isProductOfTheDayExpired(storedProduct)) {
      this.setNewProductOfTheDay(products);
    } else {
      this.productOfTheDay = storedProduct;
    }
  }

  private getStoredProductOfTheDay(): IProduct | null {
    const productStr = localStorage.getItem(PRODUCT_OF_THE_DAY_KEY);
    return productStr ? (JSON.parse(productStr) as IProduct) : null;
  }

  private isProductOfTheDayExpired(product: IProduct): boolean {
    return new Date(product.expirationTime!) <= new Date();
  }

  setNewProductOfTheDay(products: IProduct[]): void {
    this.productOfTheDay = {
      ...this.getRandomProduct(products),
      expirationTime: this.calculateNextDay(),
    };

    localStorage.setItem(
      PRODUCT_OF_THE_DAY_KEY,
      JSON.stringify(this.productOfTheDay)
    );
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
    return [...products].sort((a, b) => b.price - a.price)[0];
  }

  handleAddToCart(product: IProduct) {
    this.store.dispatch(CartActions.addToCart({ product }));
  }

  ngOnDestroy(): void {
    this.allProductsSubscription.unsubscribe();
  }
}
