import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  BsModalRef,
  BsModalService,
  ModalDirective,
  ModalModule,
} from 'ngx-bootstrap/modal';
import { IProduct } from '../../../../models/product.model';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

import * as CartActions from '../../../../../store/cart/cart.actions';
import * as CartSelectors from '../../../../../store/cart/cart.selectors';
import * as UserSelectors from '../../../../../store/user/user.selectors';
import * as PurchaseActions from '../../../../../store/purchase/purchase.actions';
import * as PurchaseSelectors from '../../../../../store/purchase/purchase.selectors';
import { ClearURLPipe } from '../../../../pipes/clear-url.pipe';
import { SafeHTMLPipe } from '../../../../pipes/safe-html.pipe';
import { TruncateTextPipe } from '../../../../pipes/truncate-text.pipe';
import { RouterLink } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutService } from '../../../../../core/services/checkout.service';
import { AppState } from '../../../../../store/app.state';
import { IUser } from '../../../../models/user.model';
import { DatabaseService } from '@app/core/services/database.service';
import Stripe from 'stripe';
import { IShipping } from '@app/shared/models/purchase.model';
import { ICard } from '@app/shared/models/card.model';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  phonePattern,
  countryCodePattern,
} from '@app/pages/user-information/children/purchases/components/customer-information/constants/pattern.constants';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [
    CommonModule,
    ClearURLPipe,
    SafeHTMLPipe,
    TruncateTextPipe,
    RouterLink,
    ModalModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.scss',
  providers: [BsModalService],
})
export class CartModalComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private databaseService = inject(DatabaseService);
  public bsModalRef = inject(BsModalRef);
  private modalService = inject(BsModalService);

  modalRef?: BsModalRef;

  title?: string;
  closeBtnName?: string;

  products$!: Observable<IProduct[]>;
  totalPrice$!: Observable<number>;

  cartProducts$!: Observable<IProduct[]>;
  cartProductsArr: IProduct[] = [];

  user$!: Observable<IUser | null>;

  userDeliveryAddresses$!: Observable<IShipping[]>;
  userCreditCards$!: Observable<ICard[]>;

  isShippingDataExist: boolean = false;

  selectShippingDataForm = new FormGroup({
    deliveryAddressId: new FormControl('0'),
    cardId: new FormControl('0'),
  });

  private choosenDeliveryAddress: IShipping | undefined = undefined;
  private choosenCard: ICard | undefined = undefined;

  private userShippingDataSubscription!: Subscription;

  ngOnInit(): void {
    this.products$ = this.store.select(CartSelectors.selectCartProducts);
    this.totalPrice$ = this.store.select(CartSelectors.selectCartTotalPrice);
    this.user$ = this.store.select(UserSelectors.selectUser);

    this.getShippingDefinedData();
  }

  onIncreaseQuantity(productId: number) {
    this.store.dispatch(CartActions.increaseCountProduct({ productId }));
  }

  onDecreaseQuantity(productId: number) {
    this.store.dispatch(CartActions.decreaseCountProduct({ productId }));
  }

  onRemoveProduct(productId: number) {
    this.store.dispatch(CartActions.removeProductFromCart({ productId }));
  }

  onGoToCheckout() {
    this.bsModalRef.hide();

    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.cartProducts$.subscribe((products) => {
      this.cartProductsArr = products;
    });

    this.user$.subscribe((user) => {
      this.store.dispatch(
        PurchaseActions.initializeCheckout({
          data: {
            email: user?.userCredential?.providerData[0].email!,
            products: this.cartProductsArr!,
          },
        })
      );
    });
  }

  onOpenSelectModal(template: TemplateRef<void>) {
    this.bsModalRef.setClass('opacity-0');
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
    });
    this.modalRef.setClass('modal-dialog-centered');
  }

  onHideSelectModal() {
    this.bsModalRef.setClass('opacity-1 modal-dialog-centered');
    this.modalRef?.hide();
  }

  getShippingDefinedData() {
    this.userShippingDataSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        filter((customer): customer is Stripe.Customer => !!customer),
        switchMap((customer: Stripe.Customer) => {
          return combineLatest([
            this.databaseService.getAllDeliveryRecords(customer.id),
            this.databaseService.getAllCards(customer.id),
          ]).pipe(
            tap(([addresses, cards]) => {
              this.isShippingDataExist =
                addresses.length > 0 || cards.length > 0;
            }),
            map(([addresses, cards]) => {
              this.userDeliveryAddresses$ = of(addresses);
              this.userCreditCards$ = of(cards);
            })
          );
        })
      )
      .subscribe();
  }

  onSelectFormSubmit() {
    this.onHideSelectModal();
    const formValue = this.selectShippingDataForm.value;

    if (formValue.deliveryAddressId !== '0') {
      this.userDeliveryAddresses$
        .pipe(
          map((addresses) =>
            addresses.find(
              (address) =>
                address.id ===
                this.selectShippingDataForm.value.deliveryAddressId
            )
          ),

          tap((choosenAddress) => {
            if (choosenAddress) {
              this.choosenDeliveryAddress = choosenAddress;
            }
          })
        )
        .subscribe();
    }
    if (formValue.cardId !== '0') {
      this.userCreditCards$
        .pipe(
          map((cards) =>
            cards.find(
              (cards) => cards.id === this.selectShippingDataForm.value.cardId
            )
          ),
          tap((choosenCard) => {
            if (choosenCard) {
              this.choosenCard = choosenCard;
            }
          })
        )
        .subscribe();
    }
  }

  onResetSelectForm() {
    this.onHideSelectModal();
    this.choosenDeliveryAddress = undefined;
    this.choosenCard = undefined;
    this.selectShippingDataForm.reset({ deliveryAddressId: '0', cardId: '0' });
  }

  ngOnDestroy(): void {
    this.userShippingDataSubscription.unsubscribe();
  }
}
