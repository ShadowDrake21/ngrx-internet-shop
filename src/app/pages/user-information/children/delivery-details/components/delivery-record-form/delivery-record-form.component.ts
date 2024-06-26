// angular stuff
import { CommonModule } from '@angular/common';
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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { map, Observable, of, Subscription, switchMap } from 'rxjs';

// services
import { DatabaseService } from '@core/services/database.service';
import { UnsplashService } from '@core/services/unsplash.service';

// constants
import { phonePattern } from '../../../purchases/components/customer-information/constants/pattern.constants';

// interfaces
import { IShipping } from '@models/purchase.model';
import { IReducedUnsplashImage } from '@models/unsplash.model';

// utils
import { shuffleArray } from '@shared/utils/arrayManipulations.utils';

@Component({
  selector: 'app-delivery-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  private databaseService = inject(DatabaseService);
  private unsplashService = inject(UnsplashService);

  isEditMode: boolean = false;

  shippingForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(40),
      Validators.required,
    ]),
    phone: new FormControl('', [
      Validators.pattern(phonePattern),
      Validators.required,
    ]),
    address: new FormGroup({
      country: new FormControl('0', Validators.required),
      city: new FormControl('', Validators.required),
      line1: new FormControl('', Validators.required),
      line2: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
    }),
  });

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.shippingForm.controls.id.patchValue(
      `delivery-record_${new Date().getTime()}`
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recordForEditing']) {
      if (this.recordForEditing) {
        this.isEditMode = true;
        this.patchEditRecordToForm(this.recordForEditing);
        this.formEnableValue === 'disable' && this.shippingForm.enable();
      }
    }

    if (changes['formEnableValue']) {
      if (this.formEnableValue === 'enable') {
        this.shippingForm.enable();
      } else {
        this.shippingForm.disable();
      }
    }
  }

  onSubmit() {
    const submitSubscription = this.getDeliveryRecordBackground(
      this.shippingForm.value.address?.country!
    )
      .pipe(
        switchMap((background) => this.formDeliveryRecord(background)),
        switchMap((newDeliveryRecord) => of({ newDeliveryRecord }))
      )
      .subscribe(({ newDeliveryRecord }) => {
        this.databaseService.setDeliveryRecord(
          newDeliveryRecord,
          this.customerId,
          newDeliveryRecord.id!
        );

        if (this.isEditMode) {
          this.sendNewDeliveryRecord.emit({
            record: newDeliveryRecord,
            mode: 'edit',
          });
          this.formEnableValue === 'disable' && this.shippingForm.disable();
        } else {
          this.sendNewDeliveryRecord.emit({
            record: newDeliveryRecord,
            mode: 'add',
          });
        }
        this.onFormReset();
      });

    this.subscriptions.push(submitSubscription);
  }

  getDeliveryRecordBackground(
    countryCode: string
  ): Observable<IReducedUnsplashImage> {
    const country = countryCode === 'PL' ? 'Poland' : 'Ukraine';

    return this.unsplashService.getPhotoArray(country).pipe(
      map(({ results }) => shuffleArray(results)[0]),
      map((item) => this.formBackgroundObject(item))
    );
  }

  formBackgroundObject(item: any): IReducedUnsplashImage {
    return {
      title: item.slug,
      url: item.urls.full,
      user: {
        name: item.user.username,
        link: item.user.links.html,
      },
    };
  }

  formDeliveryRecord(
    backgroundObj: IReducedUnsplashImage
  ): Observable<IShipping> {
    return of({
      background: backgroundObj,
      id: this.shippingForm.value.id!,
      name: this.shippingForm.value.name!,
      phone: this.shippingForm.value.phone!,
      address: {
        country: this.shippingForm.value.address?.country!,
        city: this.shippingForm.value.address?.city!,
        line1: this.shippingForm.value.address?.line1!,
        line2: this.shippingForm.value.address?.line2!,
        postal_code: this.shippingForm.value.address?.postalCode!,
      },
    });
  }

  onFormReset() {
    if (this.isEditMode) {
      this.isEditMode = false;
    }
    this.shippingForm.reset();
    this.shippingForm.controls.address.controls.country.patchValue('0');
    this.shippingForm.controls.id.patchValue(
      `delivery-record_${new Date().getTime()}`
    );

    this.formEnableValue === 'disable' && this.shippingForm.disable();
    this.formReset.emit();
  }

  patchEditRecordToForm(record: IShipping) {
    const { id, name, phone, address } = record;
    this.shippingForm.patchValue({
      id,
      name,
      phone,
      address: {
        country: address.country,
        city: address.city,
        line1: address.line1,
        line2: address.line2,
        postalCode: address.postal_code,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
