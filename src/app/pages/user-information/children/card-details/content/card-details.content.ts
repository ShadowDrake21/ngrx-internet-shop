import { ICard } from '@models/card.model';

export const months: string[] = [
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

export const years: string[] = [
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

export const cardNumberSelectors: string[] = [
  '.front .cd-number .num-1',
  '.front .cd-number .num-2',
  '.front .cd-number .num-3',
  '.front .cd-number .num-4',
];
export const cardHolderSelector: string = '.front .bottom .cardholder .holder';
export const cardExpirationMonthSelector: string = '.bottom .expires .month';
export const cardExpirationYearSelector: string = '.bottom .expires .year';
export const cardCVCSelector: string = '.card .cvc p';

export const cardMonthsAndYears: { months: string[]; years: string[] } = {
  months,
  years,
};

export const initialCardData: ICard = {
  cardNumber: '1234123412341234',
  cardHolder: 'Firstname Lastname',
  expirationMonth: '01',
  expirationYear: '24',
  cvc: '123',
};
