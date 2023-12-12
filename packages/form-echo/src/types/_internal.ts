import type { FormError, ValidationEvents } from '.';

export interface ErrorFormatter {
	(error: unknown, validationEvent: ValidationEvents): FormError;
}

export interface FormErrorShape<Key> {
	name: Key;
	error: FormError | null;
	validationEvent: ValidationEvents;
}
