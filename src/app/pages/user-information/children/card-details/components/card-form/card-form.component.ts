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
import { UnsplashService } from '@app/core/services/unsplash.service';
import { ICard } from '@app/shared/models/card.model';
import { IShipping } from '@app/shared/models/purchase.model';
import { changeDetailsIcons } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Observable, of, Subscription } from 'rxjs';
import { months, years } from '../../content/card-details.content';
import { faCreditCard, faXmark } from '@fortawesome/free-solid-svg-icons';

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
  cardIcon = faCreditCard;
  resetIcon = faXmark;

  @Input({ required: true }) customerId: string = '';
  @Input({ required: true }) formEnableValue: 'enable' | 'disable' = 'enable';
  @Input() cardForEditing!: ICard | null;

  @ViewChild('card') card!: ElementRef;

  months = months;
  years = years;

  private databaseService = inject(DatabaseService);

  @Output() sendNewCard: EventEmitter<{
    card: ICard;
    mode: 'edit' | 'add';
  }> = new EventEmitter<{ card: ICard; mode: 'edit' | 'add' }>();

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
    this.resetCardMiniature();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cardForEditing']) {
      if (this.cardForEditing) {
        this.isEditMode = true;
        this.patchEditCardToForm(this.cardForEditing);
        this.patchEditCardToCardMiniature(this.cardForEditing);
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
      /[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-]/g,
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

    const yearElement = this.card.nativeElement.querySelector(
      '.bottom .expires .year'
    );

    if (yearElement) {
      yearElement.innerText = year;
    }
  }

  updateCVC(event: any) {
    const cvc = event.target.value;
    const cvcElement = this.card.nativeElement.querySelector('.card .cvc p');
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
    const submitSubscription = this.formCardObject().subscribe((newCard) => {
      this.databaseService.setCard(newCard, this.customerId, newCard.id);

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
      expirationMonth: '01',
      expirationYear: '24',
    });
    this.resetCardMiniature();

    this.formEnableValue === 'disable' && this.cardForm.disable();
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

  patchEditCardToCardMiniature(card: ICard) {
    const { cardNumber, cardHolder, expirationMonth, expirationYear, cvc } =
      card;

    this.card.nativeElement.querySelector(
      '.front .cd-number .num-1'
    ).textContent = cardNumber.slice(0, 4);
    this.card.nativeElement.querySelector(
      '.front .cd-number .num-2'
    ).textContent = cardNumber.slice(4, 8);

    this.card.nativeElement.querySelector(
      '.front .cd-number .num-3'
    ).textContent = cardNumber.slice(8, 12);

    this.card.nativeElement.querySelector(
      '.front .cd-number .num-4'
    ).textContent = cardNumber.slice(12, 16);

    this.card.nativeElement.querySelector(
      '.front .bottom .cardholder .holder'
    ).textContent = cardHolder;

    this.card.nativeElement.querySelector('.bottom .expires .month').innerText =
      expirationMonth;

    this.card.nativeElement.querySelector('.bottom .expires .year').innerText =
      expirationYear;

    this.card.nativeElement.querySelector('.card .cvc p').textContent = cvc;
  }

  resetCardMiniature() {
    this.card.nativeElement.querySelector(
      '.front .cd-number .num-1'
    ).textContent = '1234';
    this.card.nativeElement.querySelector(
      '.front .cd-number .num-2'
    ).textContent = '1234';
    this.card.nativeElement.querySelector(
      '.front .cd-number .num-3'
    ).textContent = '1234';
    this.card.nativeElement.querySelector(
      '.front .cd-number .num-4'
    ).textContent = '1234';

    this.card.nativeElement.querySelector(
      '.front .bottom .cardholder .holder'
    ).textContent = 'Firstname Lastname';

    this.card.nativeElement.querySelector('.bottom .expires .month').innerText =
      '01';

    this.card.nativeElement.querySelector('.bottom .expires .year').innerText =
      '24';

    this.card.nativeElement.querySelector('.card .cvc p').textContent = '123';
  }

  formCardObject(): Observable<ICard> {
    const cardNumber =
      this.cardForm.value.cardNumber?.firstPart! +
      this.cardForm.value.cardNumber?.secondPart +
      this.cardForm.value.cardNumber?.thirdPart +
      this.cardForm.value.cardNumber?.fourthPart;

    return of({
      id: this.cardForm.value.id!,
      cardNumber: cardNumber,
      cardHolder: this.cardForm.value.cardHolder!,
      expirationMonth: this.cardForm.value.expirationMonth!,
      expirationYear: this.cardForm.value.expirationYear!,
      cvc: this.cardForm.value.cvc!,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
