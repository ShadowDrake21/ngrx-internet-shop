import { ICard } from '@app/shared/models/card.model';

export const formCardObject = (data: any): ICard => {
  const cardNumber =
    data.cardNumber?.firstPart! +
    data.cardNumber?.secondPart +
    data.cardNumber?.thirdPart +
    data.cardNumber?.fourthPart;

  return {
    id: data.id!,
    cardNumber: cardNumber,
    cardHolder: data.cardHolder!,
    expirationMonth: data.expirationMonth!,
    expirationYear: data.expirationYear!,
    cvc: data.cvc!,
  };
};
