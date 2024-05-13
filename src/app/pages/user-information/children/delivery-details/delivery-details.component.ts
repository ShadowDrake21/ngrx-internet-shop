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
import { map, Observable, Subscription } from 'rxjs';
import { IShipping } from '@app/shared/models/purchase.model';
import { Store } from '@ngrx/store';

import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { PurchaseState } from '@app/store/purchase/purchase.reducer';
@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [CommonModule, BasicCardComponent, ReactiveFormsModule],
  templateUrl: './delivery-details.component.html',
  styleUrl: './delivery-details.component.scss',
})
export class DeliveryDetailsComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[3];

  private store = inject(Store<PurchaseState>);
  private databaseService = inject(DatabaseService);

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
            customer.id
          );
        }
      });

    this.subscriptions.push(customerSubscription);
  }

  onSubmit() {
    console.log('form', this.shippingForm.value);
    const newDeliveryRecond: IShipping = {
      name: this.shippingForm.value.name!,
      phone: this.shippingForm.value.phone!,
      address: {
        country: this.shippingForm.value.address?.country!,
        city: this.shippingForm.value.address?.city!,
        line1: this.shippingForm.value.address?.line1!,
        line2: this.shippingForm.value.address?.line2!,
        postal_code: this.shippingForm.value.address?.postalCode!,
      },
    };

    this.deliveryRecords$
      .pipe(map((records) => `delivery-record_${records.length + 1}`))
      .subscribe((recordId) => {
        this.databaseService.addDeliveryRecord(
          newDeliveryRecond,
          this.customerId,
          recordId
        );
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
