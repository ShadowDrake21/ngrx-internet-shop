import { CommonModule } from '@angular/common';
import {
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
import { Subscription } from 'rxjs';
import { months, years } from '../../content/card-details.content';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './card-form.component.html',
  styleUrl: './card-form.component.scss',
})
export class CardFormComponent implements OnInit, OnChanges, OnDestroy {
  cardIcon = faCreditCard;

  @Input({ required: true }) customerId: string = '';
  @Input({ required: true }) formEnableValue: 'enable' | 'disable' = 'enable';
  @Input() cardForEditing!: ICard | null;

  @ViewChild('card') card!: ElementRef;

  months = months;
  years = years;

  private databaseService = inject(DatabaseService);
  private unsplashService = inject(UnsplashService);

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recordForEditing']) {
      if (this.cardForEditing) {
        this.isEditMode = true;
        this.patchEditRecordToForm(this.cardForEditing);
      }
    }

    if (changes['formEnableValue']) {
      if (this.formEnableValue === 'enable') {
        this.cardForm.enable();
      } else {
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

  onSubmit() {}

  patchEditRecordToForm(card: ICard) {
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

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}
