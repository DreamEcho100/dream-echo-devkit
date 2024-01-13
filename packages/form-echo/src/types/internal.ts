import type { FormError, ValidationEvents } from '.';

export interface ErrorFormatter {
	(error: unknown, validationEvent: ValidationEvents): FormError;
}

export interface FormErrorShape<Key> {
	name: Key;
	error: FormError | null;
	validationEvent: ValidationEvents;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TFunction = (...args: any[]) => any;
export type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
	Exclude<{} | null | undefined, TFunction>;

export type SetStateInternal<Type> = (
	partial: Type | Partial<Type> | ((state: Type) => Type | Partial<Type>),
	...params: any[]
) => void;
