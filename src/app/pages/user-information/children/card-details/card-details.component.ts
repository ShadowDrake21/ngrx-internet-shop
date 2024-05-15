import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { EventListener } from 'ngx-bootstrap/utils/facade/browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [CommonModule, BasicCardComponent],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})
export class CardDetailsComponent implements OnInit {
  userInformationItem = userInformationContent[4];

  @ViewChild('card') card!: ElementRef;
  @ViewChild('cardHolderInput') cardHolderInput!: ElementRef;

  months: string[] = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ];

  years: string[] = [
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
  ];

  constructor() {}

  ngOnInit(): void {
    const form = document.querySelector('.form');
    if (form) {
      form.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        const charLength = target.value.length;

        this.card.nativeElement.classList.remove('flip');

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
            ).textContent = target.value;
          }
        }

        if (target.classList.contains('2')) {
          if (target.value.length !== 0) {
            this.card.nativeElement.querySelector(
              '.front .cd-number .num-2'
            ).textContent = target.value;
          }
        }

        if (target.classList.contains('3')) {
          if (target.value.length !== 0) {
            this.card.nativeElement.querySelector(
              '.front .cd-number .num-3'
            ).textContent = target.value;
          }
        }

        if (target.classList.contains('4')) {
          if (target.value.length !== 0) {
            this.card.nativeElement.querySelector(
              '.front .cd-number .num-4'
            ).textContent = target.value;
          }
        }
      });
    }
  }

  handleCdHolderInput() {
    const inputValCdHolder = this.cardHolderInput.nativeElement.value;
    this.card.nativeElement.querySelector(
      '.front .bottom .cardholder .holder'
    ).textContent = inputValCdHolder;
  }

  updateExpirationMonth(event: any) {
    const month = event.target.value;
    const monthElement = this.card.nativeElement.querySelector(
      '.bottom .expires .month'
    );

    if (monthElement) {
      monthElement.innerText = month;
    }
  }

  updateExpirationYear(event: any) {
    const year = event.target.value;
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
}
