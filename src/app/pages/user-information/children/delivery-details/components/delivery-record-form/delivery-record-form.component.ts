// angular stuff
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

// services
import { DatabaseService } from '@core/services/database.service';
import { UnsplashService } from '@core/services/unsplash.service';

// interfaces
import { IShipping } from '@models/purchase.model';
import { IReducedUnsplashImage } from '@models/unsplash.model';

// utils
import { shuffleArray } from '@shared/utils/arrayManipulations.utils';
import { DeliveryRecordFormService } from './services/deliveryRecordForm.service';
import { FormErrorMessagesComponent } from './components/form-error-messages/form-error-messages.component';

@Component({
  selector: 'app-delivery-record-form',
  imports: [ReactiveFormsModule, FormErrorMessagesComponent],
  templateUrl: './delivery-record-form.component.html',
  styleUrl: './delivery-record-form.component.scss',
})
export class DeliveryRecordFormComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) customerId: string = '';
  @Input({ required: true }) formEnableValue: 'enable' | 'disable' = 'enable';
  @Input() recordForEditing!: IShipping | null;

  @Output() sendNewDeliveryRecord: EventEmitter<{
    record: IShipping;
    mode: 'edit' | 'add';
  }> = new EventEmitter<{ record: IShipping; mode: 'edit' | 'add' }>();
  @Output() formReset: EventEmitter<void> = new EventEmitter<void>();

  isSubmitted: boolean = false;

  private readonly databaseService = inject(DatabaseService);
  private readonly unsplashService = inject(UnsplashService);
  private readonly deliveryRecordFormService = inject(
    DeliveryRecordFormService
  );

  isEditMode: boolean = false;
  shippingForm = this.deliveryRecordFormService.getShippingForm();
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    console.log('Init - customerId:', this.customerId);

    this.initializeForm();
  }

  private initializeForm(): void {
    this.shippingForm.controls.id.patchValue(
      this.deliveryRecordFormService.generatDeliveryRecordId()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleRecordForEditingChange(changes);
    this.handleFormEnableValueChange(changes);
  }

  private handleRecordForEditingChange(changes: SimpleChanges): void {
    if (changes['recordForEditing'] && this.recordForEditing) {
      this.isEditMode = true;
      this.deliveryRecordFormService.patchEditRecordToForm(
        this.shippingForm,
        this.recordForEditing
      );
      this.toggleFormEnabledState();
    }
  }

  private handleFormEnableValueChange(changes: SimpleChanges): void {
    if (changes['formEnableValue']) {
      this.toggleFormEnabledState();
    }
  }

  private toggleFormEnabledState(): void {
    this.formEnableValue === 'enable'
      ? this.shippingForm.enable()
      : this.shippingForm.disable();
  }

  onSubmit() {
    if (!this.customerId || !this.shippingForm.valid) return;

    const country = this.shippingForm.value.address?.country;
    if (!country) return;

    const submitSubscription = this.getDeliveryRecordBackground(country)
      .pipe(
        switchMap((background) =>
          this.deliveryRecordFormService.formDeliveryRecord(
            this.shippingForm,
            background
          )
        ),
        switchMap((newDeliveryRecord) =>
          this.handleDeliveryRecordSubmission(newDeliveryRecord)
        )
      )
      .subscribe();

    this.subscriptions.push(submitSubscription);
  }

  private handleDeliveryRecordSubmission(record: IShipping): Observable<void> {
    try {
      return this.databaseService
        .setDeliveryRecord(record, this.customerId, record.id!)
        .pipe(
          tap(() => {
            this.sendNewDeliveryRecord.emit({
              record: record,
              mode: this.isEditMode ? 'edit' : 'add',
            });
            this.resetFormState();
          }),
          catchError((error) => {
            console.error('Error saving delivery record:', error);
            return of(undefined);
          })
        );
    } catch (error) {
      return of(undefined);
    }
  }

  private getDeliveryRecordBackground(
    countryCode: string
  ): Observable<IReducedUnsplashImage> {
    const country = countryCode === 'PL' ? 'Poland' : 'Ukraine';

    return this.unsplashService.getPhotoArray(country).pipe(
      map(({ results }) => shuffleArray(results)[0]),
      map((item) => this.deliveryRecordFormService.formBackgroundObject(item))
    );
  }

  onFormReset() {
    this.resetFormState();
    this.formReset.emit();
  }

  private resetFormState() {
    if (this.isEditMode) {
      this.isEditMode = false;
    }

    this.shippingForm.reset();
    this.initializeForm();
    this.toggleFormEnabledState();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
