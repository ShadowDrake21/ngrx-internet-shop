import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CheckoutService } from '@app/core/services/checkout.service';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { Observable, of, Subscription } from 'rxjs';
import Stripe from 'stripe';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipDirective, TooltipModule } from 'ngx-bootstrap/tooltip';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { IPurchaseUpdate } from '@app/shared/models/purchase.model';

// PURCHASES!

@Component({
  selector: 'app-purcheses',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    TabsModule,
    TooltipModule,
    ReactiveFormsModule,
  ],
  templateUrl: './purcheses.component.html',
  styleUrl: './purcheses.component.scss',
  providers: [TooltipDirective],
})
export class PurchesesComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[2];

  //  VIEW CHILDREN
  @ViewChild('nameTooltip') nameTooltip!: TooltipDirective;
  @ViewChild('descriptionTooltip') descriptionTooltip!: TooltipDirective;
  @ViewChild('shippingTooltip') shippingTooltip!: TooltipDirective;
  @ViewChild('shippingNameTooltip') shippingNameTooltip!: TooltipDirective;
  @ViewChild('shippingPhoneTooltip') shippingPhoneTooltip!: TooltipDirective;
  @ViewChild('shippingCountryTooltip')
  shippingCountryTooltip!: TooltipDirective;

  // REFACTORING + TRANSACTIONS + RENAME COMPONENTS (PURCHASE)
  private store = inject(Store<AppState>);

  customer$!: Observable<Stripe.Customer | null>;
  transactions$!: Observable<Stripe.Charge[]>;

  customerUpdateForm = new FormGroup({
    name: new FormControl('', [
      Validators.minLength(3),
      Validators.maxLength(40),
    ]),
    description: new FormControl('', [
      Validators.minLength(10),
      Validators.maxLength(100),
    ]),
    shipping: new FormGroup(
      {
        name: new FormControl('', [
          Validators.minLength(3),
          Validators.maxLength(40),
        ]),
        phone: new FormControl('', [
          Validators.pattern(
            '(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))s*[)]?[-s.]?[(]?[0-9]{1,3}[)]?([-s.]?[0-9]{3})([-s.]?[0-9]{3,4})'
          ),
        ]),
        address: new FormGroup({
          country: new FormControl('', Validators.pattern('^[A-Z]{2}$')),
          city: new FormControl(''),
          line1: new FormControl(''),
          line2: new FormControl(''),
          postalCode: new FormControl(''),
        }),
      },
      { validators: this.shippingFieldsValidator() }
    ),
  });

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    const emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .subscribe((email) => {
        this.store.dispatch(PurchaseActions.getCustomer({ email: email! }));
      });

    this.subscriptions.push(emailSubscription);

    this.customer$ = this.store.select(PurchaseSelectors.selectCustomer);

    const customerSubscription = this.customer$.subscribe((customer) => {
      if (customer) {
        this.fillCustomerUpdateForm(customer);
        this.store.dispatch(
          PurchaseActions.getAllTransactions({ customerId: customer?.id })
        );
      }
    });
    this.subscriptions.push(customerSubscription);

    this.subscriptions.push(
      this.customerUpdateForm.valueChanges.subscribe(() => {
        this.validateCustomerUpdateForm();
      })
    );

    const shippingGroup = this.customerUpdateForm.get('shipping') as FormGroup;

    const shippingControls = Object.values(shippingGroup.controls);
    shippingControls.forEach((control) => {
      if (control instanceof FormControl) {
        this.subscriptions.push(
          control.valueChanges.subscribe(() => {
            this.validateCustomerUpdateForm();
          })
        );
      }
    });
  }

  fillCustomerUpdateForm(customer: Stripe.Customer) {
    this.customerUpdateForm.patchValue({
      name: customer.name,
      description: customer.description,
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

  validateCustomerUpdateForm() {
    const nameControl = this.customerUpdateForm.controls.name;
    if (nameControl.dirty || nameControl.touched) {
      if (
        nameControl.hasError('minlength') ||
        nameControl.hasError('maxlength')
      ) {
        this.nameTooltip.tooltip =
          'Name must be at least 3 and maximum 40 characters long';
        this.nameTooltip.show();
      } else {
        this.nameTooltip.hide();
      }
    }

    const descriptionControl = this.customerUpdateForm.controls.description;
    if (descriptionControl.dirty || descriptionControl.touched) {
      if (
        descriptionControl.hasError('minlength') ||
        descriptionControl.hasError('maxlength')
      ) {
        this.descriptionTooltip.tooltip =
          'Description must be at least 10 and maximum 100 characters long';
        this.descriptionTooltip.show();
      } else {
        this.descriptionTooltip.hide();
      }
    }

    const shippingGroup = this.customerUpdateForm.controls.shipping;
    if (shippingGroup.dirty) {
      if (shippingGroup.hasError('shippingIncomplete')) {
        this.shippingTooltip.tooltip = 'You should fulfull all these fields';
        this.shippingTooltip.show();
      } else {
        this.shippingTooltip.hide();
      }
    }

    const shippingNameControl =
      this.customerUpdateForm.controls.shipping.controls.name;
    if (shippingNameControl.dirty || shippingNameControl.touched) {
      if (
        shippingNameControl.hasError('minlength') ||
        shippingNameControl.hasError('maxlength')
      ) {
        this.shippingNameTooltip.tooltip =
          'Name must be at least 3 and maximum 40 characters long';
        this.shippingNameTooltip.show();
      } else {
        this.shippingNameTooltip.hide();
      }
    }

    const shippingPhoneControl =
      this.customerUpdateForm.controls.shipping.controls.phone;
    if (shippingPhoneControl.dirty || shippingPhoneControl.touched) {
      if (shippingPhoneControl.hasError('pattern')) {
        this.shippingPhoneTooltip.tooltip =
          'Incorrect phone format. Here some examples: +1234567890, +1(234) 567-8901, +(123) 456.7890, (123) 456 7890';
        this.shippingPhoneTooltip.show();
      } else {
        this.shippingPhoneTooltip.hide();
      }
    }

    const shippingCountryControl =
      this.customerUpdateForm.controls.shipping.controls.address.controls
        .country;
    if (shippingCountryControl.dirty || shippingCountryControl.touched) {
      if (shippingCountryControl.hasError('pattern')) {
        this.shippingCountryTooltip.tooltip =
          'Incorrect country code. Here some examples: PL, US, FR';
        this.shippingCountryTooltip.show();
      } else {
        this.shippingCountryTooltip.hide();
      }
    }
  }

  onUpdateSubmit() {
    const formValues = this.customerUpdateForm.value;
    let updateObject: IPurchaseUpdate = {
      name: formValues.name ?? undefined,
      description: formValues.description ?? undefined,
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

    this.customerUpdateForm.markAsDirty();
    this.subscriptions.push(customerSubscription);
  }

  shippingFieldsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const shippingGroup = control as FormGroup;

      const anyFieldFilled = Object.values(shippingGroup.controls).some(
        (control) => {
          if (control instanceof FormGroup) {
            return this.anyNestedFieldFilled(control);
          } else {
            return control.value !== undefined && control.value !== '';
          }
        }
      );

      if (anyFieldFilled) {
        const allFieldsFilled = this.allFieldsFilled(shippingGroup);

        if (!allFieldsFilled) {
          return { shippingIncomplete: true };
        }
      }
      return null;
    };
  }

  private anyNestedFieldFilled(formGroup: FormGroup): boolean {
    return Object.values(formGroup.controls).some((control) => {
      if (control instanceof FormGroup) {
        return this.anyNestedFieldFilled(control);
      } else {
        return control.value !== undefined && control.value !== '';
      }
    });
  }

  private allFieldsFilled(formGroup: FormGroup): boolean {
    return Object.values(formGroup.controls).every((control) => {
      if (control instanceof FormGroup) {
        return this.allFieldsFilled(control);
      } else {
        return control.value !== undefined && control.value !== '';
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
