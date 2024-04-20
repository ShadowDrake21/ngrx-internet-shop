import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import { ProductsItemComponent } from '../products-item/products-item.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { map, Observable } from 'rxjs';
import { IProduct } from '../../models/product.model';
import { calcPageNum } from '../../utils/pagination.utils';
import * as CartActions from '../../../store/cart/cart.actions';
import * as CartSelectors from '../../../store/cart/cart.selectors';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, PaginationModule, ProductsItemComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit, OnChanges {
  private store = inject(Store<AppState>);
  @Input({ required: true, alias: 'items' }) listProducts$!: Observable<
    IProduct[]
  >;
  @Input() itemsPerPage: number = 6;
  @Input({ alias: 'colsStyle' }) tableSizeStyle: string = 'row-cols-md-4';

  visibleProducts$!: Observable<IProduct[]>;
  productError$!: Observable<string | null>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsIdxs$!: Observable<number[]>;

  calcPageNum = calcPageNum;

  ngOnInit(): void {
    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.cartProductsIdxs$ = this.getCartIndicesArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listProducts$']) {
      this.visibleProducts$ = this.listProducts$.pipe(
        map((products) => products.slice(0, this.itemsPerPage))
      );
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.visibleProducts$ = this.listProducts$.pipe(
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
}
