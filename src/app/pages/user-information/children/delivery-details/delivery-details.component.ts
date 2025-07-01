// angular stuff
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import {
  debounceTime,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Store } from '@ngrx/store';

// created ngrx stuff
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// interfaces
import { IShipping } from '@models/purchase.model';

// content
import { userInformationContent } from '../../content/user-information.content';

// services
import { DatabaseService } from '@core/services/database.service';

// components
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { DeliveryRecordFormComponent } from './components/delivery-record-form/delivery-record-form.component';
import { DeliveryRecordListComponent } from './components/delivery-record-item/delivery-record-item.component';

const MAX_DELIVERY_RECORDS = 6;
@Component({
  selector: 'app-delivery-details',
  imports: [
    AsyncPipe,
    BasicCardComponent,
    ReactiveFormsModule,
    FontAwesomeModule,
    DeliveryRecordFormComponent,
    DeliveryRecordListComponent,
  ],
  templateUrl: './delivery-details.component.html',
  styleUrl: './delivery-details.component.scss',
})
export class DeliveryDetailsComponent implements OnInit, OnDestroy {
  readonly userInformationItem = userInformationContent[3];
  readonly MAX_RECORDS = MAX_DELIVERY_RECORDS;

  private readonly store = inject(Store<PurchaseState>);
  private readonly databaseService = inject(DatabaseService);

  customerId: string = '';
  deliveryRecords$!: Observable<IShipping[]>;
  formEnableValue: 'enable' | 'disable' = 'enable';
  recordForEditing: IShipping | null = null;
  isLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadDeliveryDetails();
  }

  private loadDeliveryDetails(): void {
    this.isLoading = true;

    const sub = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        debounceTime(2000),
        tap(() => (this.isLoading = false))
      )
      .subscribe((customer) => {
        if (customer) {
          this.customerId = customer.id;
          this.initializeDeliveryRecords();
        }
      });

    this.subscriptions.push(sub);
  }

  private initializeDeliveryRecords(): void {
    this.deliveryRecords$ = this.databaseService.getAllDeliveryRecords(
      this.customerId
    );

    const sub = this.deliveryRecords$.subscribe((records) =>
      this.updateFormState(records.length)
    );

    this.subscriptions.push(sub);
  }

  private updateFormState(recordsCount: number): void {
    this.formEnableValue =
      recordsCount >= this.MAX_RECORDS ? 'disable' : 'enable';
  }

  handleNewDeliveryRecord({
    mode,
    record,
  }: {
    record: IShipping;
    mode: 'add' | 'edit';
  }) {
    mode === 'add' ? this.addRecord(record) : this.editRecord(record);
  }

  private addRecord(record: IShipping): void {
    this.deliveryRecords$ = this.deliveryRecords$.pipe(
      map((records) => [...records, record]),
      tap((records) => this.updateFormState(records.length))
    );
  }

  private editRecord(record: IShipping): void {
    this.deliveryRecords$ = this.deliveryRecords$.pipe(
      switchMap((records) => {
        const index = records.findIndex((r) => r.id === record.id);
        if (index === -1) {
          return throwError(() => new Error(`Record ${record.id} not found`));
        }
        const updatedRecords = [...records];
        updatedRecords[index] = record;
        return of(updatedRecords);
      })
    );
  }

  handleEditRecordRequest(recordId: string) {
    const sub: Subscription = this.deliveryRecords$
      .pipe(map((records) => records.find((record) => record.id === recordId)))
      .subscribe((record) => {
        this.recordForEditing = record ?? null;
      });

    this.subscriptions.push(sub);
  }

  handleRemoveRecordRequest(recordId: string) {
    const sub = this.databaseService
      .deleteDeliveryRecord(this.customerId, recordId)
      .subscribe(() => {
        this.deliveryRecords$ = this.deliveryRecords$.pipe(
          map((records) => {
            const updatedRecords = records.filter(
              (record) => record.id !== recordId
            );
            this.updateFormState(updatedRecords.length);
            return updatedRecords;
          })
        );
      });

    this.subscriptions.push(sub);
  }

  handleFormReset() {
    this.recordForEditing = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}
