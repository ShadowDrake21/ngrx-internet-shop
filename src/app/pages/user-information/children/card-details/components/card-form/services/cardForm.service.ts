import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ICardForm } from '../types/form.types';
import { ICard } from '@app/shared/models/card.model';

@Injectable()
export class CardFormService {
  private readonly DEFAULT_MONTH = '01';
  private readonly DEFAULT_YEAR = '24';

  getCardDataForm(): ICardForm {
    return new FormGroup({
      id: new FormControl(''),
      cardNumber: new FormGroup({
        firstPart: new FormControl('', Validators.required),
        secondPart: new FormControl('', Validators.required),
        thirdPart: new FormControl('', Validators.required),
        fourthPart: new FormControl('', Validators.required),
      }),
      cardHolder: new FormControl('', Validators.required),
      expirationMonth: new FormControl(this.DEFAULT_MONTH, Validators.required),
      expirationYear: new FormControl(this.DEFAULT_YEAR, Validators.required),
      cvc: new FormControl('', Validators.required),
    });
  }

  generateCardId(): string {
    return `card_${new Date().getTime()}`;
  }

  patchEditCardToForm(form: ICardForm, card: ICard): void {
    const { id, cardNumber, cardHolder, expirationMonth, expirationYear, cvc } =
      card;
    form.patchValue({
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

  resetForm(form: ICardForm, isEnabled: boolean): void {
    form.reset();
    form.patchValue({
      id: this.generateCardId(),
      expirationMonth: isEnabled ? this.DEFAULT_MONTH : '',
      expirationYear: isEnabled ? this.DEFAULT_YEAR : '',
    });
  }

  sanitizeCardHolderInput(input: string): string {
    return input.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]/g, '');
  }

  sanitizeCardNumberInput(input: string): string {
    return input.replace(/\D/g, '');
  }
}
