// angular stuff
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
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
  standalone: true,
  imports: [CommonModule, SafeHTMLPipe, ClearURLPipe, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit, OnDestroy {
  private store = inject(Store<CategoryState>);

  categories$!: Observable<ICategory[]>;
  error$!: Observable<string | null>;

  basicCategoryCount: number = 4;
  mainCategories$!: Observable<ICategory[]>;

  secondaryCategories$!: Observable<ICategory[]>;
  secondaryCategoryId: number | null = null;

  private categoriesSubscription!: Subscription;

  handleImageError = handleImageUnavailable;

  ngOnInit(): void {
    this.store.dispatch(CategoryActions.loadCategories());
    this.categories$ = this.store.select(CategorySelectors.selectCategories);
    this.error$ = this.store.select(CategorySelectors.selectErrorMessage);

    this.handleCategories();
  }

  handleCategories() {
    this.categoriesSubscription = this.categories$.subscribe((categories) => {
      this.mainCategories$ = of(categories.slice(0, this.basicCategoryCount));
      if (categories.length <= this.basicCategoryCount) {
        return;
      }

      this.secondaryCategories$ = of(
        categories.slice(this.basicCategoryCount, categories.length)
      );
    });
  }

  selectChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    this.secondaryCategoryId = parseInt(el.value);
  }

  ngOnDestroy(): void {
    this.categoriesSubscription.unsubscribe();
  }
}
