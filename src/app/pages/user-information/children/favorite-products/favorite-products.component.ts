// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Store } from '@ngrx/store';
import { debounceTime, map, Observable, Subscription, tap } from 'rxjs';
import { AsyncPipe, CommonModule, KeyValuePipe } from '@angular/common';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as FavoritesSelectors from '@store/favorites/favorites.selectors';

// interfaces
import { IProduct } from '@models/product.model';

// components
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { FavoriteProductsItemComponent } from './components/favorite-products-item/favorite-products-item.component';
import { FavoriteProductsService } from './services/favoriteProducts.service';
import { IFavoriteCategory } from './types/favorite-products.types';

@Component({
  selector: 'app-favorite-products',
  imports: [
    AsyncPipe,
    KeyValuePipe,
    BasicCardComponent,
    CarouselModule,
    PaginationModule,
    FavoriteProductsItemComponent,
  ],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.scss',
})
export class FavoriteProductsComponent implements OnDestroy {
  readonly userInformationItem = userInformationContent[5];
  readonly itemsPerPage: number = 3;
  readonly itemsPerSlide: number = 3;

  private readonly store = inject(Store<AppState>);
  private readonly favoritesService = inject(FavoriteProductsService);

  favorites$!: Observable<IProduct[]>;
  categories: IFavoriteCategory = {};
  visibleCategories: IFavoriteCategory = {};
  favoritesLoading = false;

  private subscriptions: Subscription[] = [];

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.favoritesLoading = true;

    this.favorites$ = this.store.select(FavoritesSelectors.selectFavorites);

    const sub = this.favorites$
      .pipe(
        debounceTime(2000),
        tap(() => (this.favoritesLoading = false)),
        map((favorites) => this.processFavorites(favorites))
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  private processFavorites(favorites: IProduct[]): void {
    {
      this.categories = favorites.reduce(
        (acc, favorite) =>
          this.favoritesService.setFavoriteProductInCategory(acc, favorite),
        {} as IFavoriteCategory
      );

      this.categories = this.favoritesService.reorganizeCategories(
        this.categories
      );
      this.updateVisibleCategories(0, this.itemsPerPage);
    }
  }

  private updateVisibleCategories(startItem: number, endItem: number): void {
    this.visibleCategories = this.favoritesService.setVisibleCategories(
      this.categories,
      startItem,
      endItem
    );
  }

  pageChanged(event: PageChangedEvent): void {
    const startIndex = (event.page - 1) * event.itemsPerPage;
    const endIndex = event.page * event.itemsPerPage;

    this.visibleCategories = this.favoritesService.setVisibleCategories(
      this.categories,
      startIndex,
      endIndex
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
