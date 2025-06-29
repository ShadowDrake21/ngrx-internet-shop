import { FormGroup, FormControl } from '@angular/forms';

export type IShippingForm = FormGroup<{
  id: FormControl<string>;
  name: FormControl<string>;
  phone: FormControl<string>;
  address: FormGroup<{
    country: FormControl<string>;
    city: FormControl<string>;
    line1: FormControl<string>;
    line2: FormControl<string>;
    postalCode: FormControl<string>;
  }>;
}>;
