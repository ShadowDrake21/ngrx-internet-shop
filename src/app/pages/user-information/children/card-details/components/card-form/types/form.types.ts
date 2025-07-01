import { FormGroup, FormControl } from '@angular/forms';

export type ICardForm = FormGroup<{
  id: FormControl<string | null>;
  cardNumber: FormGroup<{
    firstPart: FormControl<string | null>;
    secondPart: FormControl<string | null>;
    thirdPart: FormControl<string | null>;
    fourthPart: FormControl<string | null>;
  }>;
  cardHolder: FormControl<string | null>;
  expirationMonth: FormControl<string | null>;
  expirationYear: FormControl<string | null>;
  cvc: FormControl<string | null>;
}>;
