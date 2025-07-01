// angular stuff
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
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
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Stripe from 'stripe';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as CartActions from '@store/cart/cart.actions';
import * as CartSelectors from '@store/cart/cart.selectors';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseActions from '@store/purchase/purchase.actions';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// interfaces
import { IProduct } from '@models/product.model';
import { IShipping } from '@models/purchase.model';
import { ICard } from '@models/card.model';

// pipes
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

// services
import { DatabaseService } from '@core/services/database.service';

@Component({
  selector: 'app-cart-modal',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    ClearURLPipe,
    SafeHTMLPipe,
    TruncateTextPipe,
    ModalModule,
    ReactiveFormsModule,
  ],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.scss',
  providers: [BsModalService],
})
export class CartModalComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store<AppState>);
  private readonly databaseService = inject(DatabaseService);
  private readonly modalService = inject(BsModalService);
  public readonly bsModalRef = inject(BsModalRef);

  modalRef?: BsModalRef;
  title?: string;
  closeBtnName?: string;

  products$ = this.store.select(CartSelectors.selectCartProducts);
  totalPrice$ = this.store.select(CartSelectors.selectCartTotalPrice);
  user$ = this.store.select(UserSelectors.selectUser);
  userDeliveryAddresses$!: Observable<IShipping[]>;
  userCreditCards$!: Observable<ICard[]>;

  cartProductsArr: IProduct[] = [];
  isShippingDataExist: boolean = false;
  private choosenDeliveryAddress: IShipping | undefined;
  private choosenCard: ICard | undefined;

  selectShippingDataForm = new FormGroup({
    deliveryAddressId: new FormControl('0'),
    cardId: new FormControl('0'),
  });

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.setupShippingData();
  }

  updateProductQuantity(productId: number, action: 'increase' | 'decrease') {
    const actionMap = {
      increase: CartActions.increaseCountProduct,
      decrease: CartActions.decreaseCountProduct,
    };
    this.store.dispatch(actionMap[action]({ productId }));
  }

  onRemoveProduct(productId: number) {
    this.store.dispatch(CartActions.removeProductFromCart({ productId }));
  }

  onGoToCheckout() {
    this.bsModalRef.hide();

    this.subscriptions.add(
      combineLatest([
        this.store.select(CartSelectors.selectCartProducts),
        this.user$,
      ]).subscribe(([products, user]) => {
        if (user?.userCredential?.providerData[0].email) {
          this.store.dispatch(
            PurchaseActions.initializeCheckout({
              data: {
                email: user.userCredential.providerData[0].email,
                products: products,
                ...(this.choosenDeliveryAddress && {
                  deliveryAddress: this.choosenDeliveryAddress,
                }),
                ...(this.choosenCard && { paymentMethod: this.choosenCard }),
              },
            })
          );
        }
      })
    );
  }

  openSelectionModal(template: TemplateRef<void>): void {
    this.bsModalRef.setClass('opacity-0');
    this.modalRef = this.modalService.show(template, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'modal-dialog-centered',
    });
  }

  closeSelectionModal() {
    this.bsModalRef.setClass('opacity-1 modal-dialog-centered');
    this.modalRef?.hide();
  }

  private setupShippingData() {
    this.subscriptions.add(
      this.store
        .select(PurchaseSelectors.selectCustomer)
        .pipe(
          filter((customer): customer is Stripe.Customer => !!customer),
          switchMap((customer: Stripe.Customer) =>
            combineLatest([
              this.databaseService.getAllDeliveryRecords(customer.id),
              this.databaseService.getAllCards(customer.id),
            ])
          ),
          tap(([addresses, cards]) => {
            this.isShippingDataExist = addresses.length > 0 || cards.length > 0;
            this.userDeliveryAddresses$ = of(addresses);
            this.userCreditCards$ = of(cards);
          })
        )
        .subscribe()
    );
  }

  onSelectFormSubmit() {
    this.closeSelectionModal();

    const { cardId, deliveryAddressId } = this.selectShippingDataForm.value;

    if (deliveryAddressId && deliveryAddressId !== '0') {
      this.subscriptions.add(
        this.userDeliveryAddresses$
          .pipe(
            map((addresses) =>
              addresses.find((address) => address.id === deliveryAddressId)
            ),
            tap((address) => {
              if (address) {
                this.choosenDeliveryAddress = address;
              }
            })
          )
          .subscribe()
      );
    }
    if (cardId && cardId !== '0') {
      this.subscriptions.add(
        this.userCreditCards$
          .pipe(
            map((cards) => cards.find((cards) => cards.id === cardId)),
            tap((card) => {
              if (card) {
                this.choosenCard = card;
              }
            })
          )
          .subscribe()
      );
    }
  }

  resetSelectForm() {
    this.closeSelectionModal();
    this.choosenDeliveryAddress = undefined;
    this.choosenCard = undefined;
    this.selectShippingDataForm.reset({ deliveryAddressId: '0', cardId: '0' });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
