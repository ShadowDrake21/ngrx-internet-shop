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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { filter, Observable, tap } from 'rxjs';

// interfaces
import { IFilterFormObj } from '@models/forms.model';

// static content
import { filterCategories } from './content/filter-categories.content';

@Component({
  selector: 'app-filter-sidebar',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss',
})
export class FilterSidebarComponent implements OnInit, OnChanges {
  readonly filterCategories = filterCategories;

  private readonly cdr = inject(ChangeDetectorRef);

  @Input({ required: true, alias: 'categoryId' }) categoryId$!: Observable<
    number | null
  >;

  @Output() filterData: EventEmitter<IFilterFormObj> =
    new EventEmitter<IFilterFormObj>();

  @Output() restoreSignal: EventEmitter<void> = new EventEmitter<void>();

  restoreBtn: boolean = false;

  filterForm = new FormGroup({
    category: new FormControl<number | null>(null),
    maxPriceLimit: new FormControl<number>(0, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.initializeCatetoryFilter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isFilterRestore']) {
      this.resetForm();
    }
  }

  private initializeCatetoryFilter(): void {
    this.categoryId$
      .pipe(
        filter((id): id is number => id !== null),
        tap((id) => {
          this.filterForm.patchValue({ category: id });
        })
      )
      .subscribe();
  }

  applyFilter(): void {
    this.setRestoreButtonState(true);
    this.emitFilterData();
    this.markForCheck();
  }

  private emitFilterData(): void {
    this.filterData.emit({
      categoryId: this.filterForm.value.category ?? null,
      maxPriceLimit: this.filterForm.value.maxPriceLimit ?? null,
    });
  }

  resetForm() {
    this.filterForm.reset({
      category: null,
      maxPriceLimit: 0,
    });
  }

  private setRestoreButtonState(state: boolean): void {
    this.restoreBtn = state;
  }

  restoreProducts() {
    this.setRestoreButtonState(false);
    this.resetForm();
    this.restoreSignal.emit();
    this.cdr.detectChanges();
  }

  private markForCheck(): void {
    this.cdr.markForCheck();
  }
}
