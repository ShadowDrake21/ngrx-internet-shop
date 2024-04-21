import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CategoryState } from '../../store/category/category.reducer';
import { Observable, of } from 'rxjs';
import { ICategory } from '../../shared/models/category.model';
import * as CategoryActions from '../../store/category/category.actions';
import * as CategorySelectors from '../../store/category/category.selectors';
import { SafeHTMLPipe } from '../../shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '../../shared/pipes/clear-url.pipe';
import { RouterLink } from '@angular/router';
import { handleImageUnavailable } from '../../shared/utils/errorHandlers.utils';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, SafeHTMLPipe, ClearURLPipe, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private store = inject(Store<CategoryState>);

  categories$!: Observable<ICategory[]>;
  error$!: Observable<string | null>;

  basicCategoryCount: number = 4;
  mainCategories$!: Observable<ICategory[]>;

  secondaryCategories$!: Observable<ICategory[]>;
  secondaryCategoryId: number | null = null;

  handleImageError = handleImageUnavailable;

  ngOnInit(): void {
    this.store.dispatch(CategoryActions.loadCategories());
    this.categories$ = this.store.select(CategorySelectors.selectCategories);
    this.error$ = this.store.select(CategorySelectors.selectErrorMessage);

    this.handleCategories();
  }

  handleCategories() {
    this.categories$.subscribe((categories) => {
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
}
