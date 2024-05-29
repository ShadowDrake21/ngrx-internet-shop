// angular stuff
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [
    CommonModule,
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
  userInformationItem = userInformationContent[3];

  private store = inject(Store<PurchaseState>);
  private databaseService = inject(DatabaseService);

  customerId: string = '';
  deliveryRecords$!: Observable<IShipping[]>;
  sizeRestriction: number = 6;

  formEnableValue: 'enable' | 'disable' = 'enable';
  recordForEditing: IShipping | null = null;

  deliveryDetailsLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.deliveryDetailsLoading = true;
    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        debounceTime(2000),
        tap(() => (this.deliveryDetailsLoading = false))
      )
      .subscribe((customer) => {
        if (customer) {
          this.customerId = customer.id;
          this.deliveryRecords$ = this.databaseService.getAllDeliveryRecords(
            this.customerId
          );
          const deliveryRecordsSubscription = this.deliveryRecords$.subscribe(
            (records) => {
              if (records.length >= 6) {
                this.formEnableValue = 'disable';
              }
            }
          );

          this.subscriptions.push(deliveryRecordsSubscription);
        }
      });

    this.subscriptions.push(customerSubscription);
  }

  removeDeliveryRecord(id: string) {
    const removeSubscription = this.databaseService
      .deleteDeliveryRecord(this.customerId, id)
      .subscribe(() => {
        this.deliveryRecords$ = this.deliveryRecords$.pipe(
          map((records) => {
            if (records.length === 6) {
              this.formEnableValue = 'enable';
            }
            return records.filter((record) => record.id !== id);
          })
        );
      });

    this.subscriptions.push(removeSubscription);
  }

  addNewRecord(newRecord: IShipping) {
    this.deliveryRecords$ = this.deliveryRecords$.pipe(
      map((existingRecords) => {
        return [...existingRecords, newRecord];
      }),
      tap((newRecordsArray) => {
        if (newRecordsArray.length === 6) {
          this.formEnableValue = 'disable';
        }
      })
    );
  }

  editExistingRecord(editRecord: IShipping) {
    this.deliveryRecords$ = this.deliveryRecords$.pipe(
      switchMap((records) => {
        const recordIndex = records.findIndex(
          (record) => record.id === editRecord.id
        );
        if (recordIndex !== -1) {
          const updatedRecords = [...records];
          updatedRecords[recordIndex] = editRecord;
          return of(updatedRecords);
        } else {
          return throwError(
            () => new Error(`Record with id ${editRecord.id} not found.`)
          );
        }
      })
    );
  }

  handleNewDeliveryRecord(object: { record: IShipping; mode: 'add' | 'edit' }) {
    const { record, mode } = object;

    if (mode === 'add') {
      this.addNewRecord(record);
    } else {
      this.editExistingRecord(record);
    }
  }

  handleEditRecordRequest(recordId: string) {
    const handleEditRecordRequestSubscription: Subscription =
      this.deliveryRecords$
        .pipe(
          map((records) => records.find((record) => record.id === recordId))
        )
        .subscribe((record) => {
          this.recordForEditing = record!;
        });

    this.subscriptions.push(handleEditRecordRequestSubscription);
  }

  handleRemoveRecordRequest(recordId: string) {
    this.removeDeliveryRecord(recordId);
  }

  handleFormReset() {
    this.recordForEditing = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
