// angular stuff
import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipDirective, TooltipModule } from 'ngx-bootstrap/tooltip';
import { Observable, Subscription } from 'rxjs';
import Stripe from 'stripe';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as PurchaseActions from '@store/purchase/purchase.actions';

// utils
import { CustomerInformationService } from './services/customerInformation.service';
import { EditCustomerInformationComponent } from './components/edit-customer-information/edit-customer-information.component';
import { ViewCustomerInformationComponent } from './components/view-customer-information/view-customer-information.component';

@Component({
  selector: 'app-customer-information',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TabsModule,
    TooltipModule,
    EditCustomerInformationComponent,
    ViewCustomerInformationComponent,
  ],
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss',
  providers: [TooltipDirective],
})
export class CustomerInformationComponent implements OnInit, OnDestroy {
  @Input({ alias: 'customer', required: true })
  customer$!: Observable<Stripe.Customer | null>;

  private readonly store = inject(Store<AppState>);
  private readonly customerService = inject(CustomerInformationService);
  private subscriptions: Subscription[] = [];

  readonly customerUpdateForm = this.customerService.getCustomerUpdateForm();

  ngOnInit(): void {
    this.initializeCustomerForm();
  }

  private initializeCustomerForm() {
    this.subscriptions.push(
      this.customer$.subscribe((customer) => {
        if (customer) {
          this.customerService.fillCustomerUpdateForm(
            this.customerUpdateForm,
            customer
          );
        }
      })
    );

    this.subscriptions.push(
      this.customerUpdateForm.valueChanges.subscribe(() => {
        this.customerService.validateCustomerUpdateForm(
          this.customerUpdateForm
        );
      })
    );
  }

  onUpdateSubmit() {
    const formValues = this.customerUpdateForm.value;
    if (formValues.billing?.country === '0') {
      formValues.billing.country = undefined;
    }
    if (formValues.shipping?.address?.country === '0') {
      formValues.shipping.address.country = undefined;
    }

    const updateObject = this.customerService.createUpdateObject(formValues);

    this.subscriptions.push(
      this.customer$.subscribe((customer) => {
        if (customer?.id) {
          this.store.dispatch(
            PurchaseActions.updateCustomer({
              customerId: customer.id,
              updateObject,
            })
          );
        }
      })
    );
    this.customerUpdateForm.markAsUntouched();
  }

  onCancelChanges() {
    this.subscriptions.push(
      this.customer$.subscribe((customer) => {
        if (customer) {
          this.customerService.fillCustomerUpdateForm(
            this.customerUpdateForm,
            customer
          );
        }
      })
    );

    this.customerUpdateForm.markAsUntouched();
  }

  onFormReset() {
    this.customerService.onFormReset(this.customerUpdateForm);
    this.customerUpdateForm.markAsUntouched();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
