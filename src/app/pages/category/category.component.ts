// angular stuff
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { filter, map, Observable, Subscription, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// interfaces
import { IProduct } from '@models/product.model';
import { ICategory } from '@models/category.model';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as ProductActions from '@store/product/product.actions';
import * as ProductSelectors from '@store/product/product.selectors';
import * as CategoryActions from '@store/category/category.actions';
import * as CategorySelectors from '@store/category/category.selectors';

// components
import { ProductsListComponent } from '@shared/components/products-list/products-list.component';

@Component({
  selector: 'app-category',
  imports: [
    AsyncPipe,
    PaginationModule,
    ProductsListComponent,
    RouterLink,
    FontAwesomeModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store<AppState>);
  private readonly route = inject(ActivatedRoute);

  readonly category$!: Observable<ICategory>;
  readonly categoryProducts$!: Observable<IProduct[]>;
  readonly categoryError$!: Observable<string | null>;
  readonly arrowLeft = faArrowLeft;

  private subscriptions = new Subscription();

  constructor() {
    this.category$ = this.store
      .select(CategorySelectors.selectCategories)
      .pipe(map((categories) => categories[0]));

    this.categoryProducts$ = this.store.select(ProductSelectors.selectProducts);
    this.categoryError$ = this.store.select(
      CategorySelectors.selectErrorMessage
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParamMap
        .pipe(
          map((params: ParamMap) => +params.get('id')!),
          filter((categoryId) => !isNaN(categoryId)),
          tap((categoryId) => {
            this.loadCategoryData(categoryId);
          })
        )
        .subscribe()
    );
  }

  private loadCategoryData(categoryId: number): void {
    this.store.dispatch(CategoryActions.loadCategoryById({ categoryId }));
    this.store.dispatch(ProductActions.loadProductsByCategory({ categoryId }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
