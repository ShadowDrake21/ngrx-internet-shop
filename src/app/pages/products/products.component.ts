import { CommonModule } from '@angular/common';
import { Component, importProvidersFrom, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable, switchMap } from 'rxjs';

import { ProductState } from '../../store/product/products.reducer';
import { IProduct } from '../../shared/models/product.model';
import * as ProductActions from '../../store/product/product.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import { ProductsItemComponent } from './components/products-item/products-item.component';
import {
  PageChangedEvent,
  PaginationComponent,
  PaginationModule,
} from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductsItemComponent, FormsModule, PaginationModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<ProductState>);
  private productService = inject(ProductService);

  products$!: Observable<IProduct[]>;
  visibleProducts$!: Observable<IProduct[]>;
  error$!: Observable<string | null>;

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProduct());
    this.products$ = this.store.select(ProductSelectors.selectProducts);
    this.error$ = this.store.select(ProductSelectors.selectErrorMessage);

    this.visibleProducts$ = this.products$.pipe(
      map((products) => products.slice(0, 8))
    );
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.visibleProducts$ = this.products$.pipe(
      map((products) => products.slice(startItem, endItem))
    );
  }
}
