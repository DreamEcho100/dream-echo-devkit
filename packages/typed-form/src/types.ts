import { FormEvent, FormHTMLAttributes, InputHTMLAttributes } from 'react';

import type { StoreApi } from 'zustand';

// type TObjKeyString<T extends keyof Record<string, TFieldShape>> = Exclude<keyof T, number | symbol>

export type TInputDateTypes =
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'week'
	| 'month';

export type TFieldShape = {
	value: unknown;
	handleValidation?: (value: unknown) => unknown;
	validateOnChange?: boolean;
	validateOnSubmit?: boolean;
	error?: string;
	fieldErrorFormatter?: (error: unknown) => string;
	hasValueChangedSinceLastError?: boolean;
};

export type TFieldsShape = Record<string, TFieldShape>;

export type TFormStoreDataShape<TFields extends TFieldsShape> = {
	shared: {
		validateOnChange?: boolean;
		validateOnSubmit: boolean;
		fieldErrorFormatter: (error: unknown) => string;
	};
	fields: TFields;
	setFieldValue: <TName extends keyof TFields>(params: {
		name: TName;
		value: TFields[TName]['value'];
		validateOnChange?: TFields[TName]['validateOnChange'];
	}) => void;
	setFieldsError: (
		errors: Partial<Record<keyof TFields, string> | Record<string, string>>, // ! Maybe it could be handled better
	) => void;
	getFieldErrorFormatter: (name?: keyof TFields) => (error: unknown) => string;
};

export type TFormStoreApi<TFields extends TFieldsShape> = StoreApi<
	TFormStoreDataShape<TFields>
>;

export type TValue<TFields extends TFieldsShape> = Record<
	keyof TFields,
	TFields[keyof TFields]['value']
>;

export type TFormProps<TFields extends TFieldsShape> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: TFormStoreApi<TFields>;
		handleOnSubmit?: (params: {
			event: FormEvent<HTMLFormElement>;
			values: TValue<TFields>;
		}) => void;
		// customValidationOnSubmit?: (values: TValue<TFields>) => void
	};

export type TInputFieldProps<TFields extends TFieldsShape> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> & {
	store: TFormStoreApi<TFields>;
	name: Exclude<keyof TFields, number | symbol>;
};
