// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// interfaces
import { IProduct } from '../../shared/models/product.model';
import { ICategory } from '../../shared/models/category.model';

// created ngrx stuff
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/product/product.actions';
import * as ProductSelectors from '../../store/product/product.selectors';
import * as CategoryActions from '../../store/category/category.actions';
import * as CategorySelectors from '../../store/category/category.selectors';

// components
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
    RouterLink,
    FontAwesomeModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);

  arrowLeft = faArrowLeft;

  categoryId$!: Observable<number>;
  category$!: Observable<ICategory>;

  categoryProducts$!: Observable<IProduct[]>;

  categoryError$!: Observable<string | null>;

  private categoryIdSubscription!: Subscription;

  ngOnInit(): void {
    this.categoryId$ = this.route.queryParamMap.pipe(
      map((params: ParamMap) => +params.get('id')!)
    );

    this.categoryIdSubscription = this.categoryId$.subscribe((categoryId) => {
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

  ngOnDestroy(): void {
    this.categoryIdSubscription.unsubscribe();
  }
}
