// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';

// components
import { ProductsItemComponent } from './components/products-item/products-item.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';

// interfaces
import { IFilterFormObj } from '../../shared/models/forms.model';
import { IBreadcrumbs } from '../../shared/models/breadcrumbs.model';
import { IProduct } from '../../shared/models/product.model';

// created ngrx stuff
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/product/product.actions';
import * as CartActions from '../../store/cart/cart.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import * as CartSelectors from '../../store/cart/cart.selectors';

// utils
import { calcPageNum } from '../../shared/utils/pagination.utils';

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
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<AppState>);

  products$!: Observable<IProduct[]>;
  visibleProducts$!: Observable<IProduct[]>;
  error$!: Observable<string | null>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsIdxs$!: Observable<number[]>;

  filteredProducts$!: Observable<IProduct[]>;
  filteredProductsError$!: Observable<string>;

  itemsPerPage: number = 6;
  calcPageNum = calcPageNum;

  breadcrumbs: IBreadcrumbs = {
    links: ['home'],
    current: 'Products',
  };

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProduct());
    this.products$ = this.store.select(ProductSelectors.selectProducts);
    this.error$ = this.store.select(ProductSelectors.selectErrorMessage);

    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.cartProductsIdxs$ = this.getCartIndicesArray();

    this.visibleProducts$ = this.products$.pipe(
      map((products) => products.slice(0, this.itemsPerPage))
    );
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.visibleProducts$ = this.products$.pipe(
      map((products) => products.slice(startItem, endItem))
    );
  }

  handleAddToCart(product: IProduct) {
    this.store.dispatch(CartActions.addToCart({ product }));
  }

  getCartIndicesArray(): Observable<number[]> {
    return this.cartProducts$.pipe(
      map((products) => products.map((product) => product.id))
    );
  }

  handleFilterData(filterData: IFilterFormObj) {
    this.store.dispatch(ProductActions.filterProducts({ filterData }));
  }

  onRestoreProducts() {
    this.store.dispatch(ProductActions.loadProduct());
  }
}
