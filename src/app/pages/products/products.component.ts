import { CommonModule } from '@angular/common';
import {
  Component,
  importProvidersFrom,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, switchMap } from 'rxjs';

import { ProductState } from '../../store/product/products.reducer';
import { IProduct } from '../../shared/models/product.model';
import { ProductsItemComponent } from './components/products-item/products-item.component';
import {
  PageChangedEvent,
  PaginationComponent,
  PaginationModule,
} from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';

import * as ProductActions from '../../store/product/product.actions';
import * as CartActions from '../../store/cart/cart.actions';

import * as ProductSelectors from '../../store/product/product.selectors';
import * as CartSelectors from '../../store/cart/cart.selectors';
import { AppState } from '../../store/app.state';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { IFilterFormObj } from '../../shared/models/forms.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ProductsItemComponent,
    FormsModule,
    PaginationModule,
    FilterSidebarComponent,
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

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProduct());
    this.products$ = this.store.select(ProductSelectors.selectProducts);
    this.error$ = this.store.select(ProductSelectors.selectErrorMessage);

    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.cartProductsIdxs$ = this.getCartIndicesArray();

    this.visibleProducts$ = this.products$.pipe(
      map((products) => products.slice(0, 6))
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
