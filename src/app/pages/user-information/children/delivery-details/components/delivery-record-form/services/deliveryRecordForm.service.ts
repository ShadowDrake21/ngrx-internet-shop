import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { phonePattern } from '@app/pages/user-information/children/purchases/components/customer-information/constants/pattern.constants';
import { IShippingForm } from '../types/form.types';
import { IShipping } from '@app/shared/models/purchase.model';
import { IReducedUnsplashImage } from '@app/shared/models/unsplash.model';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryRecordFormService {
  getShippingForm(): IShippingForm {
    return new FormGroup({
      id: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      name: new FormControl('', {
        validators: [
          Validators.minLength(3),
          Validators.maxLength(40),
          Validators.required,
        ],
        nonNullable: true,
      }),
      phone: new FormControl('', {
        validators: [Validators.pattern(phonePattern), Validators.required],
        nonNullable: true,
      }),
      address: new FormGroup({
        country: new FormControl<string>('0', {
          validators: [Validators.required],
          nonNullable: true,
        }),
        city: new FormControl<string>('', {
          validators: [Validators.required],
          nonNullable: true,
        }),
        line1: new FormControl<string>('', {
          validators: [Validators.required],
          nonNullable: true,
        }),
        line2: new FormControl<string>('', {
          validators: [Validators.required],
          nonNullable: true,
        }),
        postalCode: new FormControl<string>('', {
          validators: [Validators.required],
          nonNullable: true,
        }),
      }),
    });
  }

  formDeliveryRecord(
    form: IShippingForm,
    backgroundObj: IReducedUnsplashImage
  ): Observable<IShipping> {
    return of({
      background: backgroundObj,
      id: form.value.id ?? '',
      name: form.value.name ?? '',
      phone: form.value.phone ?? '',
      address: {
        country: form.value.address?.country ?? '',
        city: form.value.address?.city ?? '',
        line1: form.value.address?.line1 ?? '',
        line2: form.value.address?.line2 ?? '',
        postal_code: form.value.address?.postalCode ?? '',
      },
    });
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

  patchEditRecordToForm(form: IShippingForm, record: IShipping) {
    const { id, name, phone, address } = record;
    form.patchValue({
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

  generatDeliveryRecordId(): string {
    return `delivery-record_${new Date().getTime()}`;
  }
}
