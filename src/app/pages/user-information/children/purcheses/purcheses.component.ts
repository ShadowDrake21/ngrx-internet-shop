import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-purcheses',
  standalone: true,
  imports: [CommonModule, BasicCardComponent, TabsModule, ReactiveFormsModule],
  templateUrl: './purcheses.component.html',
  styleUrl: './purcheses.component.scss',
})
export class PurchesesComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[2];

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
    address: new FormGroup({
      country: new FormControl(''),
      city: new FormControl(''),
      address1: new FormControl(''),
      address2: new FormControl(''),
      postalCode: new FormControl(''),
    }),
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
      if (customer?.id) {
        this.store.dispatch(
          PurchaseActions.getAllTransactions({ customerId: customer?.id })
        );
      }
    });
    this.subscriptions.push(customerSubscription);
  }

  fillCustomerUpdateForm(customer: Stripe.Customer) {
    this.customerUpdateForm.patchValue({
      name: customer.name,
      description: customer.description,
      address: {
        country: customer.address?.country,
        city: customer.address?.city,
        address1: customer.address?.country,
        address2: customer.address?.country,
        postalCode: customer.address?.postal_code,
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
