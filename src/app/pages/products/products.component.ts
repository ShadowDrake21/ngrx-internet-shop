// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';

// components
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';

// interfaces
import { IFilterFormObj } from '@models/forms.model';
import { IProduct } from '@models/product.model';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as ProductActions from '@store/product/product.actions';
import * as ProductSelectors from '@store/product/product.selectors';

// utils
import { ProductsListComponent } from '@shared/components/products-list/products-list.component';

// services
import { CategoryService } from '@core/services/category.service';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    FormsModule,
    PaginationModule,
    FilterSidebarComponent,
    ProductsListComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);

  categoryId$!: Observable<number | null>;
  products$!: Observable<IProduct[]>;

  constructor() {
    this.categoryId$ = this.initCategoryId();
    this.products$ = this.store.select(ProductSelectors.selectProducts);
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  private initCategoryId(): Observable<number | null> {
    return this.activatedRoute.queryParams.pipe(
      map((params) => params['category'] as string | undefined),
      switchMap((categoryName) =>
        categoryName ? this.getCategoryIdByName(categoryName) : of(null)
      )
    );
  }

  private getCategoryIdByName(name: string): Observable<number | null> {
    return this.categoryService
      .getCategoryByName(name)
      .pipe(map((category) => category?.id ?? null));
  }

  handleFilterData(filterData: IFilterFormObj) {
    this.store.dispatch(ProductActions.filterProducts({ filterData }));
  }

  onRestoreProducts() {
    this.store.dispatch(ProductActions.loadProducts());
    this.updateQueryParams({ category: null });
  }

  private updateQueryParams(params: { [key: string]: any }): void {
    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
