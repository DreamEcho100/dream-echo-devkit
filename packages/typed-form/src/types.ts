import type { StoreApi } from 'zustand';

import type { FormEvent, FormHTMLAttributes, InputHTMLAttributes } from 'react';

export type InputDateTypes =
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'week'
	| 'month';
type FieldErrors =
	| {
			errors: [];
			isDirty: false;
	  }
	| {
			errors: string[];
			isDirty: true;
	  };
export type AllFieldsErrors<TFields extends AllFieldsShape> = Record<
	keyof TFields,
	string[] | []
> & {
	___generic: string[] | [];
};

type HandleValidation = (value: unknown) => unknown;
type FieldErrorFormatter = (
	error: unknown,
) => Exclude<FieldShape['errors'], []>;
type AllFieldsErrorFormatter<TFields extends AllFieldsShape> = (
	error: unknown,
) => Partial<AllFieldsErrors<TFields>>;

export type FieldShape<Value = unknown> = FieldErrors & {
	value: Value;

	validationDefaultHandler?: HandleValidation;
	validateOnBlur?: boolean | HandleValidation;
	validateOnChange?: boolean | HandleValidation;
	validateOnMount?: boolean | HandleValidation;
	validateOnSubmit?: boolean | HandleValidation;

	fieldToStoreFormatter?: (value: any) => Value;
	storeToFieldFormatter?: (value: any) => any;

	fieldErrorFormatter?: FieldErrorFormatter;
	isTouched: boolean;
	isUncontrolled?: boolean;
};

export type AllFieldsShape = Record<string, FieldShape>;

export interface FormStoreDataShape<TFields extends AllFieldsShape> {
	fieldsShared: {
		validationDefaultHandler?: HandleValidation;
		validateOnBlur?: boolean | HandleValidation;
		validateOnChange?: boolean | HandleValidation;
		validateOnMount?: boolean | HandleValidation;
		validateOnSubmit?: boolean | HandleValidation;

		// isUncontrolled?: boolean;

		fieldErrorFormatter: FieldErrorFormatter;
	};
	errors: AllFieldsErrors<TFields>;
	isDirty: boolean;
	fields: TFields;
	form: {
		validateAllFieldsOnSubmit: boolean | HandleValidation;
		isTouched: boolean;
		isFieldsUncontrolled?: boolean;
		submitCounter: number;

		handleValidateFieldsOnSubmit?: HandleValidation;
		allFieldsErrorsFormatter?: AllFieldsErrorFormatter<TFields>;
	};

	/**
	 * Updates the value of a specific field, and validates it if necessary. It then updates
	 * the form state with the updated values, and marks the field as dirty and the form as
	 * dirty as well. If there is an error during validation, it sets the field as dirty and
	 * sets the error in the form state.
	 *
	 * @param {string} name - The name of the field to update.
	 * @param {any} value - The new value of the field.
	 * @returns {void}
	 */
	setFieldValue: (params: {
		name: keyof TFields;
		value: TFields[keyof TFields]['value'];
		validateOnChange?: TFields[keyof TFields]['validateOnChange'];
	}) => void;
	/**
	 * Update the error message of multiple fields and mark them as not having a value change since the last error message
	 * @param errors - An object containing the field names as keys and their error messages as values
	 * @returns An updated state object with the modified fields
	 */
	setFieldsError: (
		errors: Partial<
			Record<keyof TFields, NonNullable<FieldShape['errors']>>
			// | Record<string, NonNullable<FieldShape['errors']>>
		>, // ! Maybe it could be handled better
	) => void;
	/**
	 * Returns the field error formatter function for a specific field name or the shared field error formatter.
	 * If the field has a specific field error formatter, it is returned. Otherwise, the shared field error formatter
	 * is returned.
	 *
	 * @param name The name of the field to get the field error formatter for. If omitted, the shared field error formatter is returned.
	 * @returns The field error formatter function.
	 */
	getFieldErrorFormatter: (
		name?: keyof TFields,
	) => (error: unknown) => FieldShape['errors'];

	// getIsFieldIsUncontrolled: (name: keyof TFields) => boolean | undefined;
	getFieldValidateOnChange: (
		name: keyof TFields,
	) => Exclude<FieldShape['validateOnChange'], boolean>;
	getIsFieldValidatingOnChange: (
		name: keyof TFields,
	) => Exclude<FieldShape['validateOnChange'], HandleValidation>;
}

export type FormStoreApi<TFields extends AllFieldsShape> = StoreApi<
	FormStoreDataShape<TFields>
>;

export type Value<TFields extends AllFieldsShape> = Record<
	keyof TFields,
	TFields[keyof TFields]['value']
>;

export type FormProps<TFields extends AllFieldsShape> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: FormStoreApi<TFields>;
		handleOnSubmit?: (params: {
			event: FormEvent<HTMLFormElement>;
			values: Value<TFields>;
		}) => void;
	};

export type FieldProps<TFields extends AllFieldsShape> = {
	store: FormStoreApi<TFields>;
	name: Exclude<keyof TFields, number | symbol>;
};

export type InputFieldProps<TFields extends AllFieldsShape> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<TFields>;

export type AllFieldsShapePartial<TAllFields extends AllFieldsShape> = Record<
	keyof TAllFields,
	Pick<TAllFields[keyof TAllFields], 'value'> &
		Partial<
			Omit<
				TAllFields[keyof TAllFields],
				'value' | 'error' | 'isDirty' | 'isTouched'
			>
		>
>;
