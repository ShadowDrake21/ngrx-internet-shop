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

  @ViewChild('nameTooltip') nameTooltip!: TooltipDirective;
  @ViewChild('descriptionTooltip') descriptionTooltip!: TooltipDirective;
  @ViewChild('addressTooltip') addressTooltip!: TooltipDirective;

  private store = inject(Store<AppState>);

  customer$!: Observable<Stripe.Customer | null>;
  transactions$!: Observable<Stripe.Charge[]>;

  customerUpdateForm = new FormGroup({
    name: new FormControl('Demtriusz', [
      Validators.minLength(3),
      Validators.maxLength(40),
    ]),
    description: new FormControl('', [
      Validators.minLength(10),
      Validators.maxLength(100),
    ]),
    address: new FormGroup(
      {
        country: new FormControl(''),
        city: new FormControl(''),
        address1: new FormControl(''),
        address2: new FormControl(''),
        postalCode: new FormControl(''),
      },
      { validators: this.addressFieldsValidator() }
    ),
  });

  updateMap!: Map<string, string>;

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

    const addressControls = Object.values(
      this.customerUpdateForm.controls.address.controls
    );
    addressControls.forEach((control) => {
      this.subscriptions.push(
        control.valueChanges.subscribe(() => {
          this.validateCustomerUpdateForm();
        })
      );
    });
  }

  fillCustomerUpdateForm(customer: Stripe.Customer) {
    this.customerUpdateForm.setValue({
      name: customer.name!,
      description: customer.description!,
      address: {
        country: customer.address?.country!,
        city: customer.address?.city!,
        address1: customer.address?.line1!,
        address2: customer.address?.line2!,
        postalCode: customer.address?.postal_code!,
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
        console.log('minlength');
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
        console.log('minlength');
        this.descriptionTooltip.show();
      } else {
        this.descriptionTooltip.hide();
      }
    }

    const addressGroup = this.customerUpdateForm.controls.address;
    if (addressGroup.dirty) {
      if (addressGroup.hasError('addressIncomplete')) {
        console.log('minlength');
        this.addressTooltip.show();
      } else {
        this.addressTooltip.hide();
      }
    }
  }

  onUpdateSubmit() {
    console.log(this.customerUpdateForm.value);
  }

  addressFieldsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const addressGroup = control as FormGroup;
      const anyFieldFilled = Object.values(addressGroup.controls).some(
        (control) => {
          const value = control.value;
          return value !== undefined && value !== '';
        }
      );

      if (anyFieldFilled) {
        let allFieldFilled = true;
        Object.values(addressGroup.controls).forEach((control) => {
          const value = control.value;
          console.log('value', value);
          if (value === undefined || value === '') {
            allFieldFilled = false;
            return;
          }
        });
        console.log('allFieldFilled', allFieldFilled);

        if (allFieldFilled) {
          return null;
        } else {
          return { addressIncomplete: true };
        }
      } else {
        return null;
      }
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
