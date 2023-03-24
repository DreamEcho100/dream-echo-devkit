import { FormEvent, FormHTMLAttributes, InputHTMLAttributes } from 'react';

import type { StoreApi } from 'zustand';

// type TObjKeyString<T extends keyof Record<string, TFieldShape>> = Exclude<keyof T, number | symbol>

export type TInputDateTypes =
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'week'
	| 'month';

type THandleValidation = (value: unknown) => unknown;
type TFieldErrorFormatter = (
	error: unknown,
) => Exclude<TFieldShape['errors'], []>;
type TAllFieldsErrorFormatter<TFields extends TAllFieldsShape> = (
	error: unknown,
) => Partial<Record<keyof TFields, TFieldShape['errors']>>;

type TFieldErrors =
	| {
			errors: [];
			isDirty: false;
	  }
	| {
			errors: string[];
			isDirty: true;
	  };
type TAllFieldsErrors<TFields extends TAllFieldsShape> =
	| {
			errors: Partial<Record<keyof TFields, string[]>>;
			isDirty: false;
	  }
	| {
			errors: Partial<Record<keyof TFields, string[]>>;
			isDirty: true;
	  };

export type TFieldShape = TFieldErrors & {
	value: unknown;

	validationDefaultHandler?: THandleValidation;
	validateOnBlur?: boolean | THandleValidation;
	validateOnChange?: boolean | THandleValidation;
	validateOnMount?: boolean | THandleValidation;
	validateOnSubmit?: boolean | THandleValidation;
	fieldErrorFormatter?: TFieldErrorFormatter;
	isTouched: boolean;
};

export type TAllFieldsShape = Record<string, TFieldShape>;

export type TFormStoreDataShape<TFields extends TAllFieldsShape> = {
	fieldsShared: {
		validationDefaultHandler?: THandleValidation;
		validateFieldOnBlur?: boolean | THandleValidation;
		validateFieldOnChange?: boolean | THandleValidation;
		validateOnMount?: boolean | THandleValidation;
		validateOnSubmit?: boolean | THandleValidation;

		fieldErrorFormatter: TFieldErrorFormatter;
	};
	fields: TFields;
	form: TAllFieldsErrors<TFields> & {
		validateAllFieldsOnSubmit: boolean | THandleValidation;
		allFieldErrorFormatter?: TAllFieldsErrorFormatter<TFields>;
		isTouched: boolean;
		submitCounter: number;
	};

	setFieldValue: (params: {
		name: keyof TFields;
		value: TFields[keyof TFields]['value'];
		validateOnChange?: TFields[keyof TFields]['validateOnChange'];
	}) => void;
	setFieldsError: (
		errors: Partial<
			| Record<keyof TFields, NonNullable<TFieldShape['errors']>>
			| Record<string, NonNullable<TFieldShape['errors']>>
		>, // ! Maybe it could be handled better
	) => void;
	getFieldErrorFormatter: (
		name?: keyof TFields,
	) => (error: unknown) => TFieldShape['errors'];
};

export type TFormStoreApi<TFields extends TAllFieldsShape> = StoreApi<
	TFormStoreDataShape<TFields>
>;

export type TValue<TFields extends TAllFieldsShape> = Record<
	keyof TFields,
	TFields[keyof TFields]['value']
>;

export type TFormProps<TFields extends TAllFieldsShape> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: TFormStoreApi<TFields>;
		handleOnSubmit?: (params: {
			event: FormEvent<HTMLFormElement>;
			values: TValue<TFields>;
		}) => void;
		// customValidationOnSubmit?: (values: TValue<TFields>) => void
	};

export type TInputFieldProps<TFields extends TAllFieldsShape> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> & {
	store: TFormStoreApi<TFields>;
	name: Exclude<keyof TFields, number | symbol>;
};
