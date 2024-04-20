import { CommonModule } from '@angular/common';
import { Component, inject, OnChanges, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { IProduct } from '../../shared/models/product.model';
import * as ProductActions from '../../store/product/product.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import * as CategoryActions from '../../store/category/category.actions';
import * as CategorySelectors from '../../store/category/category.selectors';
import { ICategory } from '../../shared/models/category.model';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ProductsItemComponent } from '../../shared/components/products-item/products-item.component';
import { ProductsListComponent } from '../../shared/components/products-list/products-list.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    PaginationModule,
    ProductsItemComponent,
    ProductsListComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit {
  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);

  categoryId$!: Observable<number>;
  category$!: Observable<ICategory>;

  categoryProducts$!: Observable<IProduct[]>;

  categoryError$!: Observable<string | null>;

  ngOnInit(): void {
    this.categoryId$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => +params.get('id')!)
    );

    this.categoryId$.subscribe((categoryId) => {
      this.store.dispatch(CategoryActions.loadCategoryById({ categoryId }));
      this.category$ = this.store
        .select(CategorySelectors.selectCategories)
        .pipe(map((categories) => categories[0]));
      this.categoryError$ = this.store.select(
        CategorySelectors.selectErrorMessage
      );

      this.store.dispatch(
        ProductActions.loadProductsByCategory({ categoryId })
      );
      this.categoryProducts$ = this.store.select(
        ProductSelectors.selectProducts
      );
    });
  }
}
