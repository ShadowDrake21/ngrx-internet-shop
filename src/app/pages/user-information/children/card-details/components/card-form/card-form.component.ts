// angular stuff
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
import { ReactiveFormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// services
import { DatabaseService } from '@core/services/database.service';

// interfaces
import { ICard } from '@models/card.model';

// content
import {
  cardCVCSelector,
  cardExpirationMonthSelector,
  cardExpirationYearSelector,
  cardHolderSelector,
  cardMonthsAndYears,
  cardNumberSelectors,
  initialCardData,
} from '../../content/card-details.content';

// utils
import { cardDetailsIcons } from '@shared/utils/icons.utils';
import { formCardObject } from '../../utils/card-details.utils';
import { CardFormService } from './services/cardForm.service';

@Component({
  selector: 'app-card-form',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './card-form.component.html',
  styleUrl: './card-form.component.scss',
})
export class CardFormComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  readonly icons = cardDetailsIcons;

  @Input({ required: true }) customerId: string = '';
  @Input({ required: true }) formEnableValue: 'enable' | 'disable' = 'enable';
  @Input() cardForEditing!: ICard | null;

  @Output() sendNewCard: EventEmitter<{
    card: ICard;
    mode: 'edit' | 'add';
  }> = new EventEmitter<{ card: ICard; mode: 'edit' | 'add' }>();
  @Output() formReset: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('card') card!: ElementRef;

  private readonly databaseService = inject(DatabaseService);
  private readonly cardFormService = inject(CardFormService);

  cardMonthsAndYears: { months: string[]; years: string[] } =
    cardMonthsAndYears;
  cardNumberSelectors = cardNumberSelectors;

  isEditMode: boolean = false;

  cardForm = this.cardFormService.getCardDataForm();

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.handleCardNumberInput();
  }

  ngAfterViewInit(): void {
    this.patchDataToCardMiniature(initialCardData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardForEditing']?.currentValue) {
      this.isEditMode = true;
      this.cardFormService.patchEditCardToForm(
        this.cardForm,
        this.cardForEditing!
      );
      this.patchDataToCardMiniature(this.cardForEditing!);
      this.formEnableValue === 'disable' && this.cardForm.enable();
    }

    if (changes['formEnableValue']) {
      this.cardFormService.resetForm(
        this.cardForm,
        this.formEnableValue === 'enable'
      );
      this.formEnableValue === 'enable'
        ? this.cardForm.enable()
        : this.cardForm.disable();
    }
  }

  handleCardNumberInput() {
    const form = document.querySelector('.form');

    form?.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;

      if (target.id !== 'cd-holder-input') {
        target.value = this.cardFormService.sanitizeCardNumberInput(
          target.value
        );

        this.handleCardNumberNavigation(target);
        this.updateCardNumberDisplay(target);
      }
    });
  }

  private handleCardNumberNavigation(target: HTMLInputElement): void {
    if (target.value.length === 4) {
      (target.nextElementSibling as HTMLInputElement)?.focus();
    }
  }
  private updateCardNumberDisplay(target: HTMLInputElement): void {
    const partIndex = Array.from(target.classList).find((cls) =>
      cls.match(/[1-4]/)
    )?.[0];

    if (partIndex && target.value.length > 0) {
      this.updateCardMiniatureText(
        cardNumberSelectors[parseInt(partIndex) - 1],
        target.value
      );
    }
  }

  handleCdHolderInput(event: any) {
    const target = event.target as HTMLInputElement;
    target.value = this.cardFormService.sanitizeCardHolderInput(target.value);
    this.updateCardMiniatureText(cardHolderSelector, target.value);
  }

  updateCardMiniatureText(selector: string, value: string): void {
    const element = this.card.nativeElement.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
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
    this.isEditMode = false;
    this.cardFormService.resetForm(
      this.cardForm,
      this.formEnableValue === 'enable'
    );
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
