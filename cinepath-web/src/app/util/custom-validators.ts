// src/app/validators/custom-validators.ts

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador de email
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty value to allow required validator to handle it
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(value) ? null : { emailInvalid: true };
  };
}

// Validador de senha (mínimo 6 caracteres)
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null; // Don't validate empty value to allow required validator to handle it
    }
    return value.length >= 6 ? null : { passwordInvalid: true };
  };
}
