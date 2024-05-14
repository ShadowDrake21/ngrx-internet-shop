import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { map, Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { IShipping } from '@app/shared/models/purchase.model';
import { Store } from '@ngrx/store';

import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
import { UnsplashService } from '@app/core/services/unsplash.service';
import {
  IReducedUnsplashImage,
  IUnsplashImageResponse,
} from '@app/shared/models/unsplash.model';
import { shuffleArray } from '@app/shared/utils/arrayManipulations.utils';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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

  editIcon = faPen;
  deleteIcon = faTrash;

  private store = inject(Store<PurchaseState>);
  private databaseService = inject(DatabaseService);
  private unsplashService = inject(UnsplashService);

  shippingForm = new FormGroup({
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
      country: new FormControl('', [Validators.required]),
      city: new FormControl('', Validators.required),
      line1: new FormControl('', Validators.required),
      line2: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
    }),
  });

  private customerId: string = '';
  deliveryRecords$!: Observable<IShipping[]>;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .subscribe((customer) => {
        if (customer) {
          this.customerId = customer.id;
          this.deliveryRecords$ = this.databaseService.getAllDeliveryRecords(
            this.customerId
          );
        }
      });
    this.subscriptions.push(customerSubscription);
  }

  onSubmit() {
    this.getDeliveryRecordBackground(this.shippingForm.value.address?.country!)
      .pipe(
        switchMap((background) => this.formDeliveryRecord(background)),
        switchMap((newDeliveryRecord) =>
          this.deliveryRecords$.pipe(
            map((record) => ({
              newDeliveryRecord,
            }))
          )
        )
      )
      .subscribe(({ newDeliveryRecord }) => {
        this.databaseService.addDeliveryRecord(
          newDeliveryRecord,
          this.customerId,
          newDeliveryRecord.id!
        );
        this.deliveryRecords$ = this.databaseService.getAllDeliveryRecords(
          this.customerId
        );
        this.shippingForm.reset();
      });
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
      id: `delivery-record_${new Date().getTime()}`,
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
    this.databaseService
      .deleteDeliveryRecord(this.customerId, id)
      .subscribe(() => {
        this.deliveryRecords$ = this.databaseService.getAllDeliveryRecords(
          this.customerId
        );
      });
  }

  editDeliveryRecord(id: string) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
