// angular stuff
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { filter, map, Observable, tap } from 'rxjs';

// interfaces
import { IFilterFormObj } from '@models/forms.model';

// static content
import { filterCategories } from './content/filter-categories.content';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss',
})
export class FilterSidebarComponent implements OnInit, OnChanges {
  filterCategories = filterCategories;

  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true, alias: 'categoryId' }) categoryId$!: Observable<
    number | null
  >;

  @Output() filterData: EventEmitter<IFilterFormObj> =
    new EventEmitter<IFilterFormObj>();

  @Output() restoreSignal: EventEmitter<void> = new EventEmitter<void>();
  restoreBtn: boolean = false;

  filterForm = new FormGroup({
    category: new FormControl(),
    maxPriceLimit: new FormControl(0),
  });

  ngOnInit(): void {
    this.categoryId$
      .pipe(
        filter((id) => !!id),
        map((id) => this.filterForm.patchValue({ category: id })),
        tap(() => {
          this.onFilter();
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

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
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }
}
