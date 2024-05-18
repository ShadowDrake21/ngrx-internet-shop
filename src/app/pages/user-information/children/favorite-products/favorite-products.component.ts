import { Component, inject, OnInit } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Store } from '@ngrx/store';
import { FavoritesState } from '@app/store/favorites/favorites.reducer';
import { map, Observable, Subscription } from 'rxjs';
import { IProduct } from '@app/shared/models/product.model';

import * as FavoritesSelectors from '@store/favorites/favorites.selectors';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClearURLPipe } from '@app/shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@app/shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    CarouselModule,
    RouterLink,
    ClearURLPipe,
    SafeHTMLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.scss',
})
export class FavoriteProductsComponent implements OnInit {
  userInformationItem = userInformationContent[5];

  private store = inject(Store<FavoritesState>);

  favorites$!: Observable<IProduct[]>;

  categories: { [categoryName: string]: IProduct[] } = {};
  private COMMON_CATEGORY = 'Common Category';

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);

    const favoritesSubscription = this.favorites$
      .pipe(
        map((favorites) => {
          console.log('favoritesSubscription', favorites);
          this.categories = {};
          favorites.map((favorite) =>
            this.setFavoriteProductInCategory(favorite)
          );
          this.reorganizeCategories();
        })
      )
      .subscribe(() => console.log('this.categories', this.categories));

    this.subscriptions.push(favoritesSubscription);
  }

  setFavoriteProductInCategory(favoriteProduct: IProduct) {
    const categoryName = favoriteProduct.category.name;

    if (!this.categories[categoryName]) {
      this.categories[categoryName] = [];
    }

    this.categories[categoryName].push(favoriteProduct);
  }

  reorganizeCategories() {
    const newCategories: { [categoryName: string]: IProduct[] } = {};

    for (const [categoryName, products] of Object.entries(this.categories)) {
      console.log(
        'Processing category:',
        categoryName,
        'with products:',
        products
      );
      if (products.length === 1) {
        if (!newCategories[this.COMMON_CATEGORY]) {
          newCategories[this.COMMON_CATEGORY] = [];
        }
        newCategories[this.COMMON_CATEGORY].push(...products);
        console.log('Moved to Common Category:', products);
      } else {
        newCategories[categoryName] = products;
        console.log('Retained category:', categoryName, products);
      }
    }
    console.log('Reorganized categories:', newCategories);
    this.categories = newCategories;
  }
}
