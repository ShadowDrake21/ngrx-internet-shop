import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
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
export class FilterSidebarComponent implements OnChanges {
  filterCategories = filterCategories;

  @Output() filterData: EventEmitter<IFilterFormObj> =
    new EventEmitter<IFilterFormObj>();

  @Output() restoreSignal: EventEmitter<void> = new EventEmitter<void>();
  restoreBtn: boolean = false;

  filterForm = new FormGroup({
    category: new FormControl(),
    maxPriceLimit: new FormControl(0),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isFilterRestore']) {
      this.onResetForm();
    }
  }

  onFilter() {
    this.setRestoreBtn(true);
    this.filterData.emit({
      categoryId: this.filterForm.value.category || null,
      maxPriceLimit: this.filterForm.value.maxPriceLimit || null,
    });
  }

  onResetForm() {
    this.filterForm.reset();
    this.filterForm.controls.maxPriceLimit.setValue(0);
  }

  setRestoreBtn(value: boolean) {
    this.restoreBtn = value;
  }

  onRestoreProducts() {
    this.setRestoreBtn(false);
    this.onResetForm();
    this.restoreSignal.emit();
  }

  // getCategoryById(categoryId: number): TFilterCategory | undefined {
  //   return this.filterCategories.find((category) => category.id === categoryId);
  // }
}
