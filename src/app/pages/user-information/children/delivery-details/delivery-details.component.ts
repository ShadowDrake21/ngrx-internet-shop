import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { phonePattern } from '../purchases/components/customer-information/constants/pattern.constants';
import { DatabaseService } from '@app/core/services/database.service';
import {
  BehaviorSubject,
  filter,
  findIndex,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { IShipping } from '@app/shared/models/purchase.model';
import { Store } from '@ngrx/store';

import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
import { UnsplashService } from '@app/core/services/unsplash.service';
import { IReducedUnsplashImage } from '@app/shared/models/unsplash.model';
import { shuffleArray } from '@app/shared/utils/arrayManipulations.utils';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { deliveryDetailsIcons } from '@app/shared/utils/icons.utils';
import {
  PageChangedEvent,
  PaginationComponent,
  PaginationModule,
} from 'ngx-bootstrap/pagination';
@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  templateUrl: './delivery-details.component.html',
  styleUrl: './delivery-details.component.scss',
})
export class DeliveryDetailsComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[3];
  icons = deliveryDetailsIcons;

  private store = inject(Store<PurchaseState>);
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
      country: new FormControl('0', [Validators.required]),
      city: new FormControl('', Validators.required),
      line1: new FormControl('', Validators.required),
      line2: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
    }),
  });

  private customerId: string = '';

  deliveryRecords$!: Observable<IShipping[]>;
  isFormEnable: boolean = true;
  sizeRestriction: number = 6;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.shippingForm.controls.id.patchValue(
      `delivery-record_${new Date().getTime()}`
    );

    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .subscribe((customer) => {
        if (customer) {
          this.customerId = customer.id;
          this.deliveryRecords$ = this.databaseService.getAllDeliveryRecords(
            this.customerId
          );
          this.deliveryRecords$.subscribe((records) => {
            if (records.length >= 6) {
              this.shippingForm.disable();
            }
          });
        }
      });

    this.subscriptions.push(customerSubscription);
  }

  onSubmit() {
    const submitSubscription = this.getDeliveryRecordBackground(
      this.shippingForm.value.address?.country!
    )
      .pipe(
        switchMap((background) => this.formDeliveryRecord(background)),
        switchMap((newDeliveryRecord) =>
          this.deliveryRecords$.pipe(
            map(() => ({
              newDeliveryRecord,
            }))
          )
        )
      )
      .subscribe(({ newDeliveryRecord }) => {
        this.databaseService.setDeliveryRecord(
          newDeliveryRecord,
          this.customerId,
          newDeliveryRecord.id!
        );

        if (this.isEditMode) {
          this.deliveryRecords$ = this.deliveryRecords$.pipe(
            switchMap((records) => {
              const recordIndex = records.findIndex(
                (record) => record.id === newDeliveryRecord.id
              );
              if (recordIndex !== -1) {
                const updatedRecords = [...records];
                updatedRecords[recordIndex] = newDeliveryRecord;
                return of(updatedRecords);
              } else {
                return throwError(
                  () =>
                    new Error(
                      `Record with id ${newDeliveryRecord.id} not found.`
                    )
                );
              }
            })
          );
        } else {
          this.deliveryRecords$ = this.deliveryRecords$.pipe(
            map((existingRecords) => {
              return [...existingRecords, newDeliveryRecord];
            }),
            tap((newRecordsArray) => {
              if (newRecordsArray.length === 6) {
                this.shippingForm.disable();
              }
            })
          );
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

  removeDeliveryRecord(id: string) {
    const removeSubscription = this.databaseService
      .deleteDeliveryRecord(this.customerId, id)
      .subscribe(() => {
        this.deliveryRecords$ = this.deliveryRecords$.pipe(
          map((records) => {
            if (records.length === 6) {
              this.shippingForm.enable();
            }
            return records.filter((record) => record.id !== id);
          })
        );
      });

    this.subscriptions.push(removeSubscription);
  }

  editDeliveryRecord(id: string) {
    const editSubscription = this.deliveryRecords$
      .pipe(map((records) => records.find((record) => record.id === id)))
      .subscribe((record) => {
        if (record) {
          this.isEditMode = true;
          this.patchEditRecordToForm(record);
        }
      });

    this.subscriptions.push(editSubscription);
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

  onFormReset() {
    if (this.isEditMode) {
      this.isEditMode = false;
    }
    this.shippingForm.reset();
    this.shippingForm.controls.address.controls.country.patchValue('0');
    this.shippingForm.controls.id.patchValue(
      `delivery-record_${new Date().getTime()}`
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
