// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Store } from '@ngrx/store';
import { debounceTime, map, Observable, Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { RouterLink } from '@angular/router';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';

// interfaces
import { IProduct } from '@models/product.model';

// pipes
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';

// components
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { FavoriteProductsItemComponent } from './components/favorite-products-item/favorite-products-item.component';

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
    PaginationModule,
    FavoriteProductsItemComponent,
  ],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.scss',
})
export class FavoriteProductsComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[5];

  private store = inject(Store<AppState>);

  favorites$!: Observable<IProduct[]>;

  private COMMON_CATEGORY = 'Common Category';
  itemsPerPage: number = 3;
  categories: { [categoryName: string]: IProduct[] } = {};
  visibleCategories: { [categoryName: string]: IProduct[] } = {};

  isUserAuthenticate: boolean = false;
  favoritesLoading: boolean = false;

  itemsPerSlide: number = 3;

  private innerWidth!: number;
  private mobileBreakpoint: number = 600;
  private desktopBreakpoint: number = 1400;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.favoritesLoading = true;

    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);

    const favoritesSubscription = this.favorites$
      .pipe(
        debounceTime(2000),
        tap(() => (this.favoritesLoading = false)),
        map((favorites) => {
          this.categories = {};
          favorites.map((favorite) =>
            this.setFavoriteProductInCategory(favorite)
          );
          this.reorganizeCategories();
          this.setVisibleCategories(0, this.itemsPerPage);
        })
      )
      .subscribe();

    this.adjustItemsPerSlide();
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
      if (products.length === 1) {
        if (!newCategories[this.COMMON_CATEGORY]) {
          newCategories[this.COMMON_CATEGORY] = [];
        }
        newCategories[this.COMMON_CATEGORY].push(...products);
      } else {
        newCategories[categoryName] = products;
      }
    }

    this.categories = newCategories;
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.setVisibleCategories(startItem, endItem);
  }

  setVisibleCategories(startItem: number, endItem: number) {
    if (Object.entries(this.visibleCategories).length) {
      this.visibleCategories = {};
    }
    for (const [categoryName, products] of Object.entries(
      this.categories
    ).slice(startItem, endItem)) {
      this.visibleCategories[categoryName] = products;
    }
  }

  private adjustItemsPerSlide() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < this.mobileBreakpoint) {
      this.itemsPerSlide = 1;
    } else if (
      this.innerWidth >= this.mobileBreakpoint &&
      this.innerWidth < this.desktopBreakpoint
    ) {
      this.itemsPerSlide = 2;
    } else {
      this.itemsPerSlide = 3;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
