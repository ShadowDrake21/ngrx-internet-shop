import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ProductState } from '../../store/product/products.reducer';
import { IProduct } from '../../shared/models/product.model';
import * as ProductActions from '../../store/product/product.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import { ProductsItemComponent } from './components/products-item/products-item.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductsItemComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent implements OnInit {
  private store = inject(Store<ProductState>);

  products$!: Observable<IProduct[]>;
  error$!: Observable<string | null>;

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProduct());
    this.products$ = this.store.select(ProductSelectors.selectProducts);
    this.error$ = this.store.select(ProductSelectors.selectErrorMessage);
  }
}
