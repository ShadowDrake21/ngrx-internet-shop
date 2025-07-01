import { Injectable, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { phonePattern } from '../constants/pattern.constants';
import { shippingFieldsValidator } from '../utils/formValidators.utils';
import {
  ICustomerUpdateForm,
  ICustomerUpdateFormValue,
} from '../types/form.types';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { errorMessages } from '../constants/errors.constants';
import Stripe from 'stripe';
import { IPurchaseUpdate } from '@app/shared/models/purchase.model';

type FormControlType = FormControl<string | null> | FormGroup;
type ValidationType = 'length' | 'pattern' | 'custom';

interface TooltipControl extends AbstractControl {
  tooltip?: TooltipDirective;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerInformationService {
  readonly errorMessages = errorMessages;

  @ViewChild('nameTooltip') nameTooltip!: TooltipDirective;
  @ViewChild('descriptionTooltip') descriptionTooltip!: TooltipDirective;
  @ViewChild('shippingTooltip') shippingTooltip!: TooltipDirective;
  @ViewChild('billingTooltip') billingTooltip!: TooltipDirective;
  @ViewChild('shippingNameTooltip') shippingNameTooltip!: TooltipDirective;
  @ViewChild('shippingPhoneTooltip') shippingPhoneTooltip!: TooltipDirective;
  @ViewChild('shippingCountryTooltip')
  shippingCountryTooltip!: TooltipDirective;

  getCustomerUpdateForm(): ICustomerUpdateForm {
    return new FormGroup({
      name: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(40),
      ]),
      description: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(100),
      ]),
      billing: new FormGroup({
        country: new FormControl<'PL' | 'UA'>('PL', { nonNullable: true }),
        city: new FormControl(''),
        line1: new FormControl(''),
        line2: new FormControl(''),
        postalCode: new FormControl(''),
      }),
      shipping: new FormGroup(
        {
          name: new FormControl('', [
            Validators.minLength(3),
            Validators.maxLength(40),
          ]),
          phone: new FormControl('', Validators.pattern(phonePattern)),
          address: new FormGroup({
            country: new FormControl<'PL' | 'UA'>('PL', { nonNullable: true }),
            city: new FormControl(''),
            line1: new FormControl(''),
            line2: new FormControl(''),
            postalCode: new FormControl(''),
          }),
        },
        { validators: shippingFieldsValidator() }
      ),
    });
  }

  validateCustomerUpdateForm(form: FormGroup): void {
    this.validateControl(form.controls['name'], 'length', errorMessages[0]);
    this.validateControl(
      form.controls['description'],
      'length',
      errorMessages[1]
    );
    this.validateControl(form.controls['billing'], 'custom', errorMessages[2]);
    this.validateControl(form.controls['shipping'], 'custom', errorMessages[2]);
    this.validateControl(
      form.get('shipping.name')!,
      'length',
      errorMessages[0]
    );
    this.validateControl(
      form.get('shipping.phone')!,
      'pattern',
      errorMessages[3]
    );
  }

  private validateControl(
    control: TooltipControl,
    errorType: ValidationType,
    message: string
  ): void {
    if (!(control.dirty || control.touched)) return;

    const tooltip = control.tooltip;
    if (!tooltip) return;

    let hasError = false;

    switch (errorType) {
      case 'length':
        hasError =
          control.hasError('minlength') || control.hasError('maxlength');
        break;
      case 'pattern':
        hasError = control.hasError('pattern');
        break;
      case 'custom':
        hasError = control.hasError('shippingIncomplete');
        break;
    }

    if (hasError) {
      tooltip.tooltip = message;
      tooltip.show();
    } else {
      tooltip.hide();
    }
  }

  fillCustomerUpdateForm(form: FormGroup, customer: Stripe.Customer) {
    form.patchValue({
      name: customer.name,
      description: customer.description,
      billing: {
        country: customer.address?.country,
        city: customer.address?.city,
        line1: customer.address?.line1,
        line2: customer.address?.line2,
        postalCode: customer.address?.postal_code,
      },
      shipping: {
        name: customer.shipping?.name,
        phone: customer.shipping?.phone,
        address: {
          country: customer.shipping?.address!.country,
          city: customer.shipping?.address!.city,
          line1: customer.shipping?.address!.line1,
          line2: customer.shipping?.address!.line2,
          postalCode: customer.shipping?.address!.postal_code,
        },
      },
    });
  }

  createUpdateObject(values: ICustomerUpdateFormValue): IPurchaseUpdate {
    return {
      name: values.name ?? undefined,
      description: values.description ?? undefined,
      address: values.billing
        ? {
            country: values.billing!.country!,
            city: values.billing!.city!,
            line1: values.billing!.line1!,
            line2: values.billing!.line2!,
            postal_code: values.billing!.postalCode!,
          }
        : undefined,
      shipping: values.shipping
        ? {
            name: values.shipping.name!,
            phone: values.shipping.phone!,
            address: {
              country: values.shipping.address!.country!,
              city: values.shipping.address!.city!,
              line1: values.shipping.address!.line1!,
              line2: values.shipping.address!.line2!,
              postal_code: values.shipping.address!.postalCode!,
            },
          }
        : undefined,
    };
  }

  onFormReset(form: ICustomerUpdateForm) {
    form.reset({
      name: '',
      description: '',
      billing: {
        country: 'PL',
        city: '',
        line1: '',
        line2: '',
        postalCode: '',
      },
      shipping: {
        name: '',
        phone: '',
        address: {
          country: 'PL',
          city: '',
          line1: '',
          line2: '',
          postalCode: '',
        },
      },
    });
  }
}
