import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  PageChangedEvent,
  PaginationComponent,
  PaginationModule,
} from 'ngx-bootstrap/pagination';
import { ProductsItemComponent } from '../products-item/products-item.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.state';
import { map, Observable, tap } from 'rxjs';
import { IProduct } from '../../models/product.model';
import { calcPageNum } from '../../utils/pagination.utils';
import * as CartActions from '../../../store/cart/cart.actions';
import * as CartSelectors from '../../../store/cart/cart.selectors';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, PaginationModule, ProductsItemComponent, FormsModule],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit, OnChanges {
  private store = inject(Store<AppState>);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true, alias: 'items' }) listProducts$!: Observable<
    IProduct[]
  >;
  @Input() itemsPerPage: number = 6;
  @Input({ alias: 'colsStyle' }) tableSizeStyle: string = 'row-cols-md-4';
  @Input() title!: string;

  @ViewChild('paginationComponent')
  paginationComponent!: PaginationComponent;

  visibleProducts$!: Observable<IProduct[]>;
  productError$!: Observable<string | null>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsIdxs$!: Observable<number[]>;

  currentPage: number = 1;
  calcPageNum = calcPageNum;
  maxSize = 5;

  ngOnInit(): void {
    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.cartProductsIdxs$ = this.getCartIndicesArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listProducts$']) {
      this.currentPage = 1;
      this.visibleProducts$ = this.listProducts$.pipe(
        map((products) => products.slice(0, this.itemsPerPage))
      );
    }
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.updateVisibleProducts(startItem, endItem);
  }

  private updateVisibleProducts(start: number, end: number): void {
    setTimeout(() => {
      this.visibleProducts$ = this.listProducts$.pipe(
        map((products) => products.slice(start, end))
      );
      this.cdr.detectChanges();
    });
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
