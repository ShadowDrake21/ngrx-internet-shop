// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// components
import { ProductsItemComponent } from '@shared/components/products-item/products-item.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';

// interfaces
import { IFilterFormObj } from '@shared/models/forms.model';
import { IProduct } from '@shared/models/product.model';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as ProductActions from '@store/product/product.actions';
import * as ProductSelectors from '@store/product/product.selectors';

// utils
import { ProductsListComponent } from '@shared/components/products-list/products-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '@app/core/services/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ProductsItemComponent,
    FormsModule,
    PaginationModule,
    FilterSidebarComponent,
    ProductsListComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<AppState>);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private categoryService = inject(CategoryService);

  categoryId$!: Observable<number | null>;
  products$!: Observable<IProduct[]>;

  filteredProducts$!: Observable<IProduct[]>;
  filteredProductsError$!: Observable<string>;

  ngOnInit(): void {
    this.categoryId$ = this.activatedRoute.queryParams.pipe(
      map((categoryRoute) => categoryRoute['category'] as string),
      switchMap((categoryStr) => {
        if (categoryStr) {
          return this.categoryService
            .getCategoryByName(categoryStr)
            .pipe(map((categoryObj) => categoryObj?.id!));
        } else {
          return of(null);
        }
      })
    );

    this.store.dispatch(ProductActions.loadProducts());
    this.products$ = this.store.select(ProductSelectors.selectProducts);
  }

  handleFilterData(filterData: IFilterFormObj) {
    this.store.dispatch(ProductActions.filterProducts({ filterData }));
    this.products$ = this.store.select(ProductSelectors.selectProducts);
  }

  onRestoreProducts() {
    this.store.dispatch(ProductActions.loadProducts());
    this.products$ = this.store.select(ProductSelectors.selectProducts);
    this.router.navigate([], {
      queryParams: {
        category: null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
