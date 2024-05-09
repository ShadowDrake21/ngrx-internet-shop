import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function shippingFieldsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const shippingGroup = control as FormGroup;

    const anyFieldFilled = Object.values(shippingGroup.controls).some(
      (control) => {
        if (control instanceof FormGroup) {
          return anyNestedFieldFilled(control);
        } else {
          return control.value !== undefined && control.value !== '';
        }
      }
    );

    if (anyFieldFilled) {
      const areAllFieldsFilled = allFieldsFilled(shippingGroup);

      if (!areAllFieldsFilled) {
        console.log('areAllFieldsFilled');
        return { shippingIncomplete: true };
      }
    }
    return null;
  };
}

function anyNestedFieldFilled(formGroup: FormGroup): boolean {
  return Object.values(formGroup.controls).some((control) => {
    console.log('anyNestedFieldFilled');
    if (control instanceof FormGroup) {
      return anyNestedFieldFilled(control);
    } else {
      return control.value !== undefined && control.value !== '';
    }
  });
}

export function allFieldsFilled(formGroup: FormGroup): boolean {
  return Object.values(formGroup.controls).every((control) => {
    if (control instanceof FormGroup) {
      return allFieldsFilled(control);
    } else {
      return control.value !== undefined && control.value !== '';
    }
  });
}
