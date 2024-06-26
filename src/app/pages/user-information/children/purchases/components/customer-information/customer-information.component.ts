// angular stuff
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipDirective, TooltipModule } from 'ngx-bootstrap/tooltip';
import { Observable, Subscription } from 'rxjs';
import Stripe from 'stripe';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as PurchaseActions from '@store/purchase/purchase.actions';

// interfaces
import { IPurchaseUpdate } from '@models/purchase.model';

// constants
import { errorMessages } from './constants/errors.constants';
import { phonePattern } from './constants/pattern.constants';

// utils
import { shippingFieldsValidator } from './utils/formValidators.utils';

@Component({
  selector: 'app-customer-information',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabsModule, TooltipModule],
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss',
  providers: [TooltipDirective],
})
export class CustomerInformationComponent implements OnInit, OnDestroy {
  @Input({ alias: 'customer', required: true })
  customer$!: Observable<Stripe.Customer | null>;

  @ViewChild('nameTooltip') nameTooltip!: TooltipDirective;
  @ViewChild('descriptionTooltip') descriptionTooltip!: TooltipDirective;
  @ViewChild('shippingTooltip') shippingTooltip!: TooltipDirective;
  @ViewChild('billingTooltip') billingTooltip!: TooltipDirective;
  @ViewChild('shippingNameTooltip') shippingNameTooltip!: TooltipDirective;
  @ViewChild('shippingPhoneTooltip') shippingPhoneTooltip!: TooltipDirective;
  @ViewChild('shippingCountryTooltip')
  shippingCountryTooltip!: TooltipDirective;

  private store = inject(Store<AppState>);

  errorMessages = errorMessages;

  customerUpdateForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(40),
    ]),
    description: new FormControl('', [
      Validators.minLength(10),
      Validators.maxLength(100),
    ]),
    billing: new FormGroup({
      country: new FormControl('0'),
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
          country: new FormControl('0'),
          city: new FormControl(''),
          line1: new FormControl(''),
          line2: new FormControl(''),
          postalCode: new FormControl(''),
        }),
      },
      { validators: shippingFieldsValidator() }
    ),
  });

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const customerSubscription = this.customer$.subscribe((customer) => {
      if (customer) {
        this.fillCustomerUpdateForm(customer);
      }
    });
    this.subscriptions.push(customerSubscription);

    this.shippingValidationPreparations();
  }

  shippingValidationPreparations() {
    this.subscriptions.push(
      this.customerUpdateForm.valueChanges.subscribe(() => {
        this.validateCustomerUpdateForm();
      })
    );
  }

  validateCustomerUpdateForm() {
    const nameControl = this.customerUpdateForm.controls.name;
    this.validateCustomerUpdateFormControl(
      nameControl,
      this.nameTooltip,
      errorMessages[0],
      'length'
    );

    const descriptionControl = this.customerUpdateForm.controls.description;
    this.validateCustomerUpdateFormControl(
      descriptionControl,
      this.descriptionTooltip,
      errorMessages[1],
      'length'
    );

    const billingGroup = this.customerUpdateForm.controls.billing;
    this.validateCustomerUpdateFormControl(
      billingGroup,
      this.billingTooltip,
      errorMessages[2],
      'custom'
    );

    const shippingGroup = this.customerUpdateForm.controls.shipping;
    this.validateCustomerUpdateFormControl(
      shippingGroup,
      this.shippingTooltip,
      errorMessages[2],
      'custom'
    );

    const shippingNameControl =
      this.customerUpdateForm.controls.shipping.controls.name;
    this.validateCustomerUpdateFormControl(
      shippingNameControl,
      this.shippingNameTooltip,
      errorMessages[0],
      'length'
    );

    const shippingPhoneControl =
      this.customerUpdateForm.controls.shipping.controls.phone;
    this.validateCustomerUpdateFormControl(
      shippingPhoneControl,
      this.shippingPhoneTooltip,
      errorMessages[3],
      'pattern'
    );
  }

  validateCustomerUpdateFormControl(
    control: FormControl | FormGroup,
    tooltip: TooltipDirective,
    message: string,
    errorType: 'length' | 'pattern' | 'custom'
  ) {
    switch (errorType) {
      case 'length':
        if (control.dirty || control.touched) {
          this.validateCustomerUpdateFormCheck(
            control.hasError('minlength') || control.hasError('maxlength'),
            tooltip,
            message
          );
        }
        break;
      case 'pattern':
        if (control.dirty || control.touched) {
          this.validateCustomerUpdateFormCheck(
            control.hasError('pattern'),
            tooltip,
            message
          );
        }
        break;

      case 'custom':
        if (control.dirty) {
          this.validateCustomerUpdateFormCheck(
            control.hasError('shippingIncomplete'),
            tooltip,
            message
          );
          break;
        }
    }
  }

  private validateCustomerUpdateFormCheck(
    booleanStatement: boolean,
    tooltip: TooltipDirective,
    message: string
  ) {
    if (booleanStatement) {
      tooltip.tooltip = message;
      tooltip.show();
    } else {
      tooltip.hide();
    }
  }

  fillCustomerUpdateForm(customer: Stripe.Customer) {
    this.customerUpdateForm.patchValue({
      name: customer.name,
      description: customer.description,
      billing: {
        country: customer.address?.country || '0',
        city: customer.address?.city,
        line1: customer.address?.line1,
        line2: customer.address?.line2,
        postalCode: customer.address?.postal_code,
      },
      shipping: {
        name: customer.shipping?.name,
        phone: customer.shipping?.phone,
        address: {
          country: customer.shipping?.address!.country || '0',
          city: customer.shipping?.address!.city,
          line1: customer.shipping?.address!.line1,
          line2: customer.shipping?.address!.line2,
          postalCode: customer.shipping?.address!.postal_code,
        },
      },
    });
  }

  onUpdateSubmit() {
    const formValues = this.customerUpdateForm.value;
    if (formValues.billing?.country === '0') {
      formValues.billing.country = undefined;
    }
    if (formValues.shipping?.address?.country === '0') {
      formValues.shipping.address.country = undefined;
    }

    let updateObject: IPurchaseUpdate = {
      name: formValues.name ?? undefined,
      description: formValues.description ?? undefined,
      address: formValues.billing
        ? {
            country: formValues.billing!.country!,
            city: formValues.billing!.city!,
            line1: formValues.billing!.line1!,
            line2: formValues.billing!.line2!,
            postal_code: formValues.billing!.postalCode!,
          }
        : undefined,
      shipping: formValues.shipping
        ? {
            name: formValues.shipping.name!,
            phone: formValues.shipping.phone!,
            address: {
              country: formValues.shipping.address!.country!,
              city: formValues.shipping.address!.city!,
              line1: formValues.shipping.address!.line1!,
              line2: formValues.shipping.address!.line2!,
              postal_code: formValues.shipping.address!.postalCode!,
            },
          }
        : undefined,
    };

    const customerSubscription = this.customer$.subscribe((customer) => {
      this.store.dispatch(
        PurchaseActions.updateCustomer({
          customerId: customer?.id!,
          updateObject,
        })
      );
    });
    this.customerUpdateForm.markAsUntouched();
    this.subscriptions.push(customerSubscription);
  }

  onCancelChanges() {
    const customerSubscription = this.customer$.subscribe((customer) => {
      if (customer) {
        this.fillCustomerUpdateForm(customer);
      }
    });

    this.customerUpdateForm.markAsUntouched();
    this.subscriptions.push(customerSubscription);
  }

  onFormReset() {
    this.customerUpdateForm.reset({
      name: '',
      description: '',
      billing: {
        country: '',
        city: '',
        line1: '',
        line2: '',
        postalCode: '',
      },
      shipping: {
        name: '',
        phone: '',
        address: {
          country: '',
          city: '',
          line1: '',
          line2: '',
          postalCode: '',
        },
      },
    });

    this.customerUpdateForm.markAllAsTouched();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
