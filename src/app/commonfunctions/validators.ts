import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noSpecialCharsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && /[^a-zA-Z0-9# ]/.test(control.value)) { // Note the space after `#`
      return { specialCharInvalid: true };
    }
    return null;
  };
}


export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(control.value)) {
      return { passwordInvalid: true };
    }
    return null;
  };
}

export function pincodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && !/^[0-9]{6}$/.test(control.value)) {
      return { pincodeInvalid: true };
    }
    return null;
  };
}

export function mobileValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !/^[0-9]{10,12}$/.test(control.value)) {
        return { mobileInvalid: true };
      }
      return null;
    };
}
