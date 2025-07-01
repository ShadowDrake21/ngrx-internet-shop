import { FormGroup, FormControl } from '@angular/forms';

export type ICustomerUpdateForm = FormGroup<{
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  billing: FormGroup<{
    country: FormControl<string | null>;
    city: FormControl<string | null>;
    line1: FormControl<string | null>;
    line2: FormControl<string | null>;
    postalCode: FormControl<string | null>;
  }>;
  shipping: FormGroup<{
    name: FormControl<string | null>;
    phone: FormControl<string | null>;
    address: FormGroup<{
      country: FormControl<string | null>;
      city: FormControl<string | null>;
      line1: FormControl<string | null>;
      line2: FormControl<string | null>;
      postalCode: FormControl<string | null>;
    }>;
  }>;
}>;

export type ICustomerUpdateFormValue = Partial<{
  name: string | null;
  description: string | null;
  billing: Partial<{
    country: string | null;
    city: string | null;
    line1: string | null;
    line2: string | null;
    postalCode: string | null;
  }>;
  shipping: Partial<{
    name: string | null;
    phone: string | null;
    address: Partial<{
      country: string | null;
      city: string | null;
      line1: string | null;
      line2: string | null;
      postalCode: string | null;
    }>;
  }>;
}>;

export type AddressGroup = FormGroup<{
  country: FormControl<string | null>;
  city: FormControl<string | null>;
  line1: FormControl<string | null>;
  line2: FormControl<string | null>;
  postalCode: FormControl<string | null>;
}>;
