export interface ICard {
  paymentMethodId?: string;
  id?: string;
  cardNumber: string;
  cardHolder: string;
  expirationMonth: string;
  expirationYear: string;
  cvc: string;
}
