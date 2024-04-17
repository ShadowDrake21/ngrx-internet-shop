import { Component, EventEmitter, Output } from '@angular/core';
import {
  filterCategories,
  TFilterCategory,
} from './content/filter-categories.content';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IFilterFormObj } from '../../../../shared/models/forms.model';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss',
})
export class FilterSidebarComponent {
  filterCategories = filterCategories;

  @Output() filterData: EventEmitter<IFilterFormObj> =
    new EventEmitter<IFilterFormObj>();

  filterForm = new FormGroup({
    category: new FormControl(),
    maxPriceLimit: new FormControl(0),
  });

  onFilter() {
    this.filterData.emit({
      categoryId: this.filterForm.value.category || null,
      maxPriceLimit: this.filterForm.value.maxPriceLimit || null,
    });
  }

  getCategoryById(categoryId: number): TFilterCategory | undefined {
    return this.filterCategories.find((category) => category.id === categoryId);
  }
}
