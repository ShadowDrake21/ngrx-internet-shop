import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CommonModule } from '@angular/common';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { months, years } from './content/card-details.content';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICard } from '@app/shared/models/card.model';
import { DatabaseService } from '@app/core/services/database.service';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import * as UserSelectors from '@store/user/user.selectors';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import { map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { changeDetailsIcons } from '@app/shared/utils/icons.utils';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    FontAwesomeModule,
    ReactiveFormsModule,
  ],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})
export class CardDetailsComponent implements OnInit {
  userInformationItem = userInformationContent[4];
  changeIcons = changeDetailsIcons;
  cardIcon = faCreditCard;

  private store = inject(Store<AppState>);
  private databaseService = inject(DatabaseService);

  @ViewChild('card') card!: ElementRef;

  months = months;
  years = years;

  cardForm = new FormGroup({
    id: new FormControl(''),
    cardNumber: new FormGroup({
      firstPart: new FormControl('', Validators.required),
      secondPart: new FormControl('', Validators.required),
      thirdPart: new FormControl('', Validators.required),
      fourthPart: new FormControl('', Validators.required),
    }),
    cardHolder: new FormControl('', Validators.required),
    expirationMonth: new FormControl('01', Validators.required),
    expirationYear: new FormControl('24', Validators.required),
    cvc: new FormControl('', Validators.required),
  });

  private customerId: string = '';
  formEnableValue: 'enable' | 'disable' = 'enable';

  cards$!: Observable<ICard[]>;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .subscribe((customer) => {
        if (customer) {
          this.customerId = customer.id;
          this.cards$ = this.databaseService.getAllCards(this.customerId);
        }
      });

    this.cardForm.controls.id.patchValue(`card_${new Date().getTime()}`);
    this.handleCardNumberInput();

    this.subscriptions.push(customerSubscription);
  }

  handleCardNumberInput() {
    const form = document.querySelector('.form');
    if (form) {
      form.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;

        if (!(target.id === 'cd-holder-input')) {
          const inputValue = target.value;
          const sanitizedValue = inputValue.replace(/\D/g, '');

          target.value = sanitizedValue;

          const charLength = sanitizedValue.length;
          if (charLength === 4) {
            const nextInput = target.nextElementSibling as HTMLInputElement;
            if (nextInput) {
              nextInput.focus();
            }
          }

          if (target.classList.contains('1')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                '.front .cd-number .num-1'
              ).textContent = sanitizedValue;
            }
          }

          if (target.classList.contains('2')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                '.front .cd-number .num-2'
              ).textContent = sanitizedValue;
            }
          }

          if (target.classList.contains('3')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                '.front .cd-number .num-3'
              ).textContent = sanitizedValue;
            }
          }

          if (target.classList.contains('4')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                '.front .cd-number .num-4'
              ).textContent = sanitizedValue;
            }
          }
        }
      });
    }
  }

  handleCdHolderInput(event: any) {
    const target = event.target;
    const inputValue = target.value;

    const sanitizedValue = inputValue.replace(
      /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]/g,
      ''
    );

    target.value = sanitizedValue;

    this.card.nativeElement.querySelector(
      '.front .bottom .cardholder .holder'
    ).textContent = sanitizedValue;
  }

  updateExpirationMonth() {
    const month = this.cardForm.get('expirationMonth')?.value;
    const monthElement = this.card.nativeElement.querySelector(
      '.bottom .expires .month'
    );

    if (monthElement) {
      monthElement.innerText = month;
    }
  }

  updateExpirationYear() {
    const year = this.cardForm.get('expirationYear')?.value;
    console.log('year', this.cardForm.value);
    const yearElement = this.card.nativeElement.querySelector(
      '.bottom .expires .year'
    );

    if (yearElement) {
      yearElement.innerText = year;
    }
  }

  updateCVC(event: any) {
    const cvc = event.target.value;
    const cvcElement = document.querySelector('.card .cvc p');
    if (cvcElement) {
      cvcElement.textContent = cvc;

      const isFlipped = this.card.nativeElement.classList.contains('flip');

      if (cvc.length > 0 && cvc.length < 3 && !isFlipped) {
        this.card.nativeElement.classList.add('flip');
      } else if ((cvc.length === 0 || cvc.length >= 3) && isFlipped) {
        this.card.nativeElement.classList.remove('flip');
      }
    }
  }

  onSubmit() {
    const cardNumber =
      this.cardForm.value.cardNumber?.firstPart! +
      this.cardForm.value.cardNumber?.secondPart +
      this.cardForm.value.cardNumber?.thirdPart +
      this.cardForm.value.cardNumber?.fourthPart;

    const newCard: ICard = {
      id: this.cardForm.value.id!,
      cardNumber: cardNumber,
      cardHolder: this.cardForm.value.cardHolder!,
      expirationMonth: this.cardForm.value.expirationMonth!,
      expirationYear: this.cardForm.value.expirationYear!,
      cvc: this.cardForm.value.cvc!,
    };

    this.databaseService.setCard(newCard, this.customerId, newCard.id);

    this.addNewCard(newCard);
    this.cardForm.reset();
    this.cardForm.controls.expirationMonth.patchValue('01');
    this.cardForm.controls.expirationYear.patchValue('24');
  }

  addNewCard(newCard: ICard) {
    this.cards$ = this.cards$.pipe(
      map((existingCards) => {
        return [...existingCards, newCard];
      }),
      tap((newCardsArray) => {
        if (newCardsArray.length === 6) {
          this.formEnableValue = 'disable';
        }
      })
    );
  }

  removeCard(cardId: string) {
    const removeSubscription = this.databaseService
      .deleteCard(this.customerId, cardId)
      .subscribe(() => {
        this.cards$ = this.cards$.pipe(
          map((cards) => {
            if (cards.length === 6) {
              this.formEnableValue = 'enable';
            }
            return cards.filter((card) => card.id !== cardId);
          })
        );
      });

    this.subscriptions.push(removeSubscription);
  }
}
