import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RoutingService } from '@app/core/services/routing.service';

import { userInformationSidebar } from '@app/shared/utils/icons.utils';
import { AppState } from '@app/store/app.state';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Store } from '@ngrx/store';
import { TabsModule } from 'ngx-bootstrap/tabs';

import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { map, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-information',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FontAwesomeModule,
    TabsModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.scss',
})
export class UserInformationComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private routingService = inject(RoutingService);

  previousRoute!: string;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
    const emailSubscription = this.store
      .select(UserSelectors.selectEmail)
      .subscribe((email) => {
        this.store.dispatch(PurchaseActions.getCustomer({ email: email! }));

        const customerSubscription = this.store
          .select(PurchaseSelectors.selectCustomer)
          .subscribe((customer) => {
            if (customer) {
              this.store.dispatch(
                PurchaseActions.getAllTransactions({ customerId: customer?.id })
              );
            }
          });
        this.subscriptions.push(customerSubscription);
      });

    this.subscriptions.push(emailSubscription);
  }

  sidebarIcons = userInformationSidebar;

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
