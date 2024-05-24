import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatabaseService } from '@app/core/services/database.service';
import { ICard } from '@app/shared/models/card.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { map, of, Subscription, switchMap } from 'rxjs';
import {
  cardCVCSelector,
  cardExpirationMonthSelector,
  cardExpirationYearSelector,
  cardHolderSelector,
  cardMonthsAndYears,
  cardNumberSelectors,
  initialCardData,
} from '../../content/card-details.content';
import { cardDetailsIcons } from '@app/shared/utils/icons.utils';
import { formCardObject } from '../../utils/card-details.utils';
import { CheckoutService } from '@app/core/services/checkout.service';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './card-form.component.html',
  styleUrl: './card-form.component.scss',
})
export class CardFormComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  icons = cardDetailsIcons;

  @Input({ required: true }) customerId: string = '';
  @Input({ required: true }) formEnableValue: 'enable' | 'disable' = 'enable';
  @Input() cardForEditing!: ICard | null;

  @Output() sendNewCard: EventEmitter<{
    card: ICard;
    mode: 'edit' | 'add';
  }> = new EventEmitter<{ card: ICard; mode: 'edit' | 'add' }>();
  @Output() formReset: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('card') card!: ElementRef;

  private databaseService = inject(DatabaseService);
  private checkoutService = inject(CheckoutService);

  cardMonthsAndYears: { months: string[]; years: string[] } =
    cardMonthsAndYears;
  cardNumberSelectors = cardNumberSelectors;

  isEditMode: boolean = false;

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

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.cardForm.controls.id.patchValue(`card_${new Date().getTime()}`);
    this.handleCardNumberInput();
  }

  ngAfterViewInit(): void {
    this.patchDataToCardMiniature(initialCardData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardForEditing']) {
      if (this.cardForEditing) {
        this.isEditMode = true;
        this.patchEditCardToForm(this.cardForEditing);
        this.patchDataToCardMiniature(this.cardForEditing);
        this.formEnableValue === 'disable' && this.cardForm.enable();
      }
    }

    if (changes['formEnableValue']) {
      if (this.formEnableValue === 'enable') {
        this.cardForm.patchValue({
          expirationMonth: '01',
          expirationYear: '24',
        });
        this.cardForm.enable();
      } else {
        this.cardForm.patchValue({ expirationMonth: '', expirationYear: '' });
        this.cardForm.disable();
      }
    }
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
                cardNumberSelectors[0]
              ).textContent = sanitizedValue;
            }
          }

          if (target.classList.contains('2')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                cardNumberSelectors[1]
              ).textContent = sanitizedValue;
            }
          }

          if (target.classList.contains('3')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                cardNumberSelectors[2]
              ).textContent = sanitizedValue;
            }
          }

          if (target.classList.contains('4')) {
            if (target.value.length !== 0) {
              this.card.nativeElement.querySelector(
                cardNumberSelectors[3]
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
      /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]/g,
      ''
    );

    target.value = sanitizedValue;

    this.card.nativeElement.querySelector(cardHolderSelector).textContent =
      sanitizedValue;
  }

  updateExpirationMonth() {
    const month = this.cardForm.get('expirationMonth')?.value;
    const monthElement = this.card.nativeElement.querySelector(
      cardExpirationMonthSelector
    );

    if (monthElement) {
      monthElement.innerText = month;
    }
  }

  updateExpirationYear() {
    const year = this.cardForm.get('expirationYear')?.value;

    const yearElement = this.card.nativeElement.querySelector(
      cardExpirationYearSelector
    );

    if (yearElement) {
      yearElement.innerText = year;
    }
  }

  updateCVC(event: any) {
    const cvc = event.target.value;
    const cvcElement = this.card.nativeElement.querySelector(cardCVCSelector);
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
    const submitSubscription = of(
      formCardObject(this.cardForm.value)
    ).subscribe((newCard) => {
      this.databaseService.setCard(newCard, this.customerId, newCard.id!);

      if (this.isEditMode) {
        this.sendNewCard.emit({ card: newCard, mode: 'edit' });
        this.formEnableValue === 'disable' && this.cardForm.disable();
      } else {
        this.sendNewCard.emit({ card: newCard, mode: 'add' });
      }

      this.onFormReset();
    });

    this.subscriptions.push(submitSubscription);
  }

  onFormReset() {
    if (this.isEditMode) {
      this.isEditMode = false;
    }
    this.cardForm.reset();
    this.cardForm.patchValue({
      id: `card_${new Date().getTime()}`,
      expirationMonth: this.formEnableValue === 'enable' ? '01' : '',
      expirationYear: this.formEnableValue === 'enable' ? '24' : '',
    });
    this.patchDataToCardMiniature(initialCardData);

    this.formEnableValue === 'disable' && this.cardForm.disable();
    this.formReset.emit();
  }

  patchEditCardToForm(card: ICard) {
    const { id, cardNumber, cardHolder, expirationMonth, expirationYear, cvc } =
      card;
    this.cardForm.patchValue({
      id,
      cardNumber: {
        firstPart: cardNumber.slice(0, 4),
        secondPart: cardNumber.slice(4, 8),
        thirdPart: cardNumber.slice(8, 12),
        fourthPart: cardNumber.slice(12, 16),
      },
      cardHolder,
      expirationMonth,
      expirationYear,
      cvc,
    });
  }

  patchDataToCardMiniature(data: ICard) {
    const { cardNumber, cardHolder, expirationMonth, expirationYear, cvc } =
      data;

    this.card.nativeElement.querySelector(cardNumberSelectors[0]).textContent =
      cardNumber.slice(0, 4);
    this.card.nativeElement.querySelector(cardNumberSelectors[1]).textContent =
      cardNumber.slice(4, 8);
    this.card.nativeElement.querySelector(cardNumberSelectors[2]).textContent =
      cardNumber.slice(8, 12);
    this.card.nativeElement.querySelector(cardNumberSelectors[3]).textContent =
      cardNumber.slice(12, 16);

    this.card.nativeElement.querySelector(cardHolderSelector).textContent =
      cardHolder;

    this.card.nativeElement.querySelector(
      cardExpirationMonthSelector
    ).innerText = expirationMonth;
    this.card.nativeElement.querySelector(
      cardExpirationYearSelector
    ).innerText = expirationYear;

    this.card.nativeElement.querySelector(cardCVCSelector).textContent = cvc;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
