import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  cardIcon = faCreditCard;

  @ViewChild('card') card!: ElementRef;

  months = months;
  years = years;

  cardForm = new FormGroup({
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

  ngOnInit(): void {
    this.handleCardNumberInput();
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
          console.log('target', target.value);
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

    const sanitizedValue = inputValue.replace(/[^a-zA-Z\s]/g, '');

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
    }
  }

  onSubmit() {
    const cardNumber =
      this.cardForm.value.cardNumber?.firstPart! +
      this.cardForm.value.cardNumber?.secondPart +
      this.cardForm.value.cardNumber?.thirdPart +
      this.cardForm.value.cardNumber?.fourthPart;

    const newCard: ICard = {
      cardNumber: cardNumber,
      cardHolder: this.cardForm.value.cardHolder!,
      expirationMonth: this.cardForm.value.expirationMonth!,
      expirationYear: this.cardForm.value.expirationYear!,
      cvc: this.cardForm.value.cvc!,
    };

    console.log(newCard);
  }
}
