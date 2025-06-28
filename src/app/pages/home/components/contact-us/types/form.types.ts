import { FormGroup, FormControl } from '@angular/forms';

export type ContactUsForm = FormGroup<{
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  subject: FormControl<string | null>;
  message: FormControl<string | null>;
}>;
