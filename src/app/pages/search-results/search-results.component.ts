import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';

// components
import { SingleSearchResultComponent } from './components/single-search-result/single-search-result.component';

// created ngrx stuff
import { ProductState } from '@store/product/products.reducer';
import * as ProductActions from '@store/product/product.actions';
import * as ProductSelectors from '@store/product/product.selectors';

// interfaces
import { IProduct } from '@models/product.model';

// utils
import { calcPageNum } from '@shared/utils/pagination.utils';
import { PageNumPipe } from '@app/shared/pipes/page-num.pipe';

@Component({
  selector: 'app-search-results',
  imports: [
    CommonModule,
    SingleSearchResultComponent,
    PaginationModule,
    PageNumPipe,
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store<ProductState>);
  private readonly route = inject(ActivatedRoute);

  readonly calcPageNum = calcPageNum;
  readonly ITEMS_PER_PAGE = 5;

  searchTerm$!: Observable<string>;
  searchedProducts$!: Observable<IProduct[]>;
  visibleProducts$!: Observable<IProduct[]>;
  paginationData$!: Observable<{
    products: IProduct[];
    totalItems: number;
    showPagination: boolean;
  }>;

  private subscriptions = new Subscription();

  constructor() {
    this.searchTerm$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => params.get('query') ?? '')
    );
    this.searchedProducts$ = this.store.select(ProductSelectors.selectProducts);

    this.visibleProducts$ = combineLatest([
      this.searchedProducts$,
      this.searchTerm$,
    ]).pipe(map(([products]) => products.slice(0, this.ITEMS_PER_PAGE)));

    this.paginationData$ = combineLatest([
      this.searchedProducts$,
      this.visibleProducts$,
    ]).pipe(
      map(([allProducts, visibleProducts]) => ({
        products: visibleProducts,
        totalItems: allProducts.length,
        showPagination: allProducts.length > this.ITEMS_PER_PAGE,
      }))
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.searchTerm$.subscribe((searchTerm) => {
        this.store.dispatch(
          ProductActions.searchProducts({
            searchTerm,
          })
        );
      })
    );
  }

  pageChanged(event: PageChangedEvent): void {
    this.visibleProducts$ = this.searchedProducts$.pipe(
      map((products) => {
        const startItem = (event.page - 1) * event.itemsPerPage;
        const endItem = event.page * event.itemsPerPage;
        return products.slice(startItem, endItem);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
