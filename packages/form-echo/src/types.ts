import type { FormEvent } from 'react';

import { type ZodSchema } from 'zod';

import type { StoreApi } from 'zustand';

export type InputDateTypes =
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'week'
	| 'month';

export type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';

export type HandleValidation<Value> = (
	value: unknown,
	validationEvent: ValidationEvents,
) => Value;
export interface FieldMetadata<Name, Value> {
	name: Name & string;
	id: string;
	initialValue: Value;
}
export interface FieldValidation<Value> {
	handler?: HandleValidation<Value>;
	events: {
		[key in ValidationEvents]: {
			isActive: boolean;
			passedAttempts: number;
			failedAttempts: number;
		};
	};
	passedAttempts: number;
	failedAttempts: number;
}
export type FieldIsDirtyErrorsAndValidation =
	| { isDirty: false; errors: null }
	| { isDirty: true; errors: string[] };
export type FieldShape<Name, Value, ValidatedValue> = {
	validation: ValidatedValue extends undefined
		? never
		: FieldValidation<ValidatedValue>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	value: Exclude<Value, Function>;
	isDirty: boolean;
	errors: string[];
	isUpdatingValueOnError: boolean;
	metadata: FieldMetadata<Name, Value>;
	valueFromFieldToStore?: (fieldValue: unknown) => Value;
	valueFromStoreToField?: (StoreValue: Value) => string;
};
export type AllFieldsShape<PassedAllFields, PassedValidatedFields> = {
	[FieldName in keyof PassedAllFields]: FieldShape<
		FieldName,
		PassedAllFields[FieldName],
		PassedValidatedFields extends { [Key in FieldName]: unknown }
			? PassedValidatedFields[FieldName]
			: never
	>;
};

export interface FormMetadata<PassedAllFields> {
	formId: string;
	fieldsNames: (keyof PassedAllFields)[];
}
export interface FormStoreShape<PassedAllFields, PassedValidatedFields> {
	fields: AllFieldsShape<PassedAllFields, PassedValidatedFields>;
	errors: { [Key in keyof PassedAllFields]?: string[] | null };
	metadata: FormMetadata<PassedAllFields>;
	isTrackingValidationHistory: boolean;
	validations: {
		history: unknown[];
		handler: {
			[Key in keyof PassedAllFields]?: HandleValidation<
				PassedValidatedFields extends { [K in Key]: unknown }
					? PassedValidatedFields[Key]
					: PassedAllFields[Key]
			>;
		};
	};
	submitCounter: number;
	utils: {
		handleOnInputChange: (name: keyof PassedAllFields, value: unknown) => void;
		errorFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
		reInitFieldsValues: () => void;
		setFieldValue: (
			name: keyof PassedAllFields,
			value:
				| ((
						value: PassedAllFields[typeof name],
				  ) => PassedAllFields[typeof name])
				| PassedAllFields[typeof name],
		) => void;
		setFieldErrors: (params: {
			name: keyof PassedAllFields;
			errors: string[] | null;
			validationEvent: ValidationEvents;
		}) => void;
		createValidationHistoryRecord: (params: {
			validationEvent: ValidationEvents;
			validationEventPhase: 'start' | 'end';
			validationEventState: 'processing' | 'failed' | 'passed';
			fields: AllFieldsShape<
				PassedAllFields,
				PassedValidatedFields
			>[keyof PassedAllFields][];
		}) => unknown;
		handleFieldValidation: (params: {
			name: keyof PassedAllFields;
			value: unknown;
			validationEvent: ValidationEvents;
		}) => PassedAllFields[keyof PassedAllFields];
		handlePreSubmit: (
			cb?: HandlePreSubmitCB<PassedAllFields, PassedValidatedFields>,
		) => (event: FormEvent<HTMLFormElement>) => void;
	};
}

export type HandlePreSubmitCB<PassedAllFields, PassedValidatedFields> = (
	event: FormEvent<HTMLFormElement>,
	params: {
		validatedValues: PassedValidatedFields extends ValidationHandler<PassedAllFields>
			? GetFieldsValueFromValidationHandler<
					PassedAllFields,
					PassedValidatedFields
			  >
			: Record<string, never>;

		values: PassedAllFields;
		hasError: boolean;
		errors: {
			[Key in keyof PassedAllFields]: {
				name: Key;
				errors: string[] | null;
				validationEvent: ValidationEvents;
			};
		};
	},
) => void;

export type CreateCreateFormStore<PassedFields, PassedValidatedFields> =
	FormStoreShape<
		{
			[Key in keyof PassedFields]: PassedFields[Key];
		},
		PassedValidatedFields
	>;

export type FormStoreApi<Fields, ValidatedFields> = StoreApi<
	CreateCreateFormStore<Fields, ValidatedFields>
>;

export type FormStoreValues<Fields> = {
	[Key in keyof Fields]: Fields extends AllFieldsShape<
		Record<string, unknown>,
		unknown
	>
		? Fields[Key]['value']
		: never;
};

export type FormStoreErrors<Fields> = {
	[Key in keyof Fields]: Fields extends AllFieldsShape<
		Record<string, unknown>,
		unknown
	>
		? Fields[Key]['errors']
		: never;
};

export type ValidationHandler<PassedFields> = {
	[Key in keyof PassedFields]?:
		| HandleValidation<unknown> // PassedFields[Key]
		| ZodSchema<unknown>;
};

export type GetFieldsValueFromValidationHandler<
	PassedFields,
	PassedValidationHandler extends ValidationHandler<PassedFields>,
> = {
	[Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown>
		? ReturnType<PassedValidationHandler[Key]['parse']>
		: PassedValidationHandler[Key] extends HandleValidation<unknown>
		? ReturnType<PassedValidationHandler[Key]>
		: never;
};

export type CreateFormStoreProps<
	PassedFields,
	StorePassedValidationHandler extends ValidationHandler<PassedFields> | never,
> = {
	initValues: PassedFields extends Record<string, unknown>
		? PassedFields
		: never;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	trackValidationHistory?: boolean;
	validationEvents?: { [key in ValidationEvents]?: boolean };
	validationHandler?: StorePassedValidationHandler extends ValidationHandler<PassedFields>
		? StorePassedValidationHandler
		: never;
	valuesFromFieldsToStore?: {
		[Key in keyof PassedFields]?: (fieldValue: string) => PassedFields[Key];
	};
	valuesFromStoreToFields?: {
		[Key in keyof PassedFields]?: (storeValue: PassedFields[Key]) => string;
	};
	errorFormatter?: (
		error: unknown,
		validationEvent: ValidationEvents,
	) => string[];
};
