// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';

// components
import { ProductsItemComponent } from '@shared/components/products-item/products-item.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';

// interfaces
import { IFilterFormObj } from '@shared/models/forms.model';
import { IBreadcrumbs } from '@shared/models/breadcrumbs.model';
import { IProduct } from '@shared/models/product.model';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as ProductActions from '@store/product/product.actions';
import * as ProductSelectors from '@store/product/product.selectors';

// utils
import { ProductsListComponent } from '@shared/components/products-list/products-list.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ProductsItemComponent,
    FormsModule,
    PaginationModule,
    FilterSidebarComponent,
    BreadcrumbsComponent,
    ProductsListComponent,
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<AppState>);

  products$!: Observable<IProduct[]>;

  filteredProducts$!: Observable<IProduct[]>;
  filteredProductsError$!: Observable<string>;

  breadcrumbs: IBreadcrumbs = {
    links: ['home'],
    current: 'Products',
  };

  ngOnInit(): void {
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
  }
}
