import { Component, inject, OnInit } from '@angular/core';
import { ProductState } from '../../store/product/products.reducer';
import { Store } from '@ngrx/store';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';
import * as ProductActions from '../../store/product/product.actions';
import * as ProductSelectors from '../../store/product/product.selectors';

import { IProduct } from '../../shared/models/product.model';
import { CommonModule } from '@angular/common';
import { SingleSearchResultComponent } from './components/single-search-result/single-search-result.component';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { calcPageNum } from '../../shared/utils/pagination.utils';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';
import { IBreadcrumbs } from '../../shared/models/breadcrumbs.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    SingleSearchResultComponent,
    PaginationModule,
    RouterLink,
    BreadcrumbsComponent,
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent implements OnInit {
  private store = inject(Store<ProductState>);
  private route = inject(ActivatedRoute);

  searchTerm$!: Observable<string>;

  searchedProducts$!: Observable<IProduct[]>;
  visibleProducts$!: Observable<IProduct[]>;

  itemsPerPage: number = 5;
  calcPageNum = calcPageNum;

  breadcrumbs: IBreadcrumbs = {
    links: ['home'],
    current: 'Search Results',
  };

  ngOnInit(): void {
    this.searchTerm$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => params.get('query'))
    ) as Observable<string>;

    this.searchTerm$.subscribe((searchTerm) => {
      this.store.dispatch(
        ProductActions.searchProducts({
          searchTerm,
        })
      );
      this.searchedProducts$ = this.store.select(
        ProductSelectors.selectProducts
      );

      this.visibleProducts$ = this.searchedProducts$.pipe(
        map((products) => products.slice(0, this.itemsPerPage))
      );
    });
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.visibleProducts$ = this.searchedProducts$.pipe(
      map((products) => products.slice(startItem, endItem))
    );
  }
}
