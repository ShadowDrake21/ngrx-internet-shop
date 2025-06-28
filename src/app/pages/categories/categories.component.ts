// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map, Observable, of, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';

// interfaces
import { ICategory } from '@models/category.model';

// created ngrx stuff
import { CategoryState } from '@store/category/category.reducer';
import * as CategoryActions from '@store/category/category.actions';
import * as CategorySelectors from '@store/category/category.selectors';

// pipes
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';

// utils
import { handleImageUnavailable } from '@shared/utils/errorHandlers.utils';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, SafeHTMLPipe, ClearURLPipe, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store<CategoryState>);
  private categoriesSubscription!: Subscription;

  private readonly BASIC_CATEGORY_COUNT = 4;

  readonly categories$ = this.store.select(CategorySelectors.selectCategories);
  readonly error$ = this.store.select(CategorySelectors.selectErrorMessage);
  readonly mainCategories$ = this.getMainCategories();
  readonly secondaryCategories$ = this.getSecondaryCategories();

  secondaryCategoryId: number | null = null;

  readonly handleImageError = handleImageUnavailable;

  ngOnInit(): void {
    this.store.dispatch(CategoryActions.loadCategories());
  }

  private getMainCategories(): Observable<ICategory[]> {
    return this.categories$.pipe(
      map((categories) => categories.slice(0, this.BASIC_CATEGORY_COUNT)),
      distinctUntilChanged()
    );
  }

  private getSecondaryCategories(): Observable<ICategory[]> {
    return this.categories$.pipe(
      map((categories) => {
        if (categories.length <= this.BASIC_CATEGORY_COUNT) {
          return [];
        }
        return categories.slice(this.BASIC_CATEGORY_COUNT);
      }),
      distinctUntilChanged()
    );
  }

  selectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.secondaryCategoryId = parseInt(selectElement.value);
  }

  ngOnDestroy(): void {
    this.categoriesSubscription.unsubscribe();
  }
}
