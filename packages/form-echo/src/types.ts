import { FormEvent } from 'react';

import { ZodSchema } from 'zod';

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
export type PassedAllFieldsShape = Record<string, unknown>;
// export type FieldNameShape = string | number | symbol;
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
export type FieldShape<Name, Value> = {
	validation: FieldValidation<Value>;
	value: Value;
	isDirty: boolean;
	errors: string[];
	isUpdatingValueOnError: boolean;
	metadata: FieldMetadata<Name, Value>;
	valueFromFieldToStore?(fieldValue: string | number): Value;
	valueFromStoreToField?(StoreValue: Value): string | number;
};
export type AllFieldsShape<PassedAllFields extends PassedAllFieldsShape> = {
	[FieldName in keyof PassedAllFields]: FieldShape<
		FieldName,
		PassedAllFields[FieldName]
	>;
};

export interface FormMetadata<PassedAllFields extends PassedAllFieldsShape> {
	formId: string;
	fieldsNames: (keyof PassedAllFields)[];
}
export interface FormStoreShape<PassedAllFields extends PassedAllFieldsShape> {
	fields: AllFieldsShape<PassedAllFields>;
	errors: { [Key in keyof PassedAllFields]?: string[] | null };
	metadata: FormMetadata<PassedAllFields>;
	isTrackingValidationHistory: boolean;
	validations: {
		history: unknown[];
		handler: {
			[Key in keyof PassedAllFields]?: HandleValidation<PassedAllFields[Key]>;
		};
	};
	submitCounter: number;
	utils: {
		handleOnInputChange: (name: keyof PassedAllFields, value: any) => void;
		errorFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
		reInitFieldsValues(): void;
		setFieldValue(
			name: keyof PassedAllFields,
			value:
				| ((
						value: unknown, // PassedAllFields[typeof name]
				  ) => PassedAllFields[typeof name])
				| unknown, // PassedAllFields[typeof name],
		): void;
		setFieldErrors(params: {
			name: keyof PassedAllFields;
			errors: string[] | null;
			validationEvent: ValidationEvents;
		}): void;
		createValidationHistoryRecord(params: {
			validationEvent: ValidationEvents;
			validationEventPhase: 'start' | 'end';
			validationEventState: 'processing' | 'failed' | 'passed';
			fields: AllFieldsShape<PassedAllFields>[keyof PassedAllFields][];
		}): unknown;
		handleFieldValidation<Name extends keyof PassedAllFields>(params: {
			name: Name;
			value: any; // unknown | PassedAllFields[Name];
			validationEvent: ValidationEvents;
		}): PassedAllFields[Name];
		handlePreSubmit: (
			cb?: HandlePreSubmitCB<PassedAllFields>,
		) => (event: FormEvent<HTMLFormElement>) => void;
	};
}

export type HandlePreSubmitCB<PassedAllFields extends Record<string, unknown>> =
	(
		event: FormEvent<HTMLFormElement>,
		params: {
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

export type CreateCreateFormStore<PassedFields> = FormStoreShape<{
	[Key in keyof PassedFields]: PassedFields[Key];
}>;

export type FormStoreApi<Fields> = StoreApi<CreateCreateFormStore<Fields>>;

export type FormStoreValues<
	TFields extends AllFieldsShape<PassedAllFieldsShape>,
> = { [Key in keyof TFields]: TFields[Key]['value'] };

export type FormStoreErrors<
	TFields extends AllFieldsShape<PassedAllFieldsShape>,
> = { [Key in keyof TFields]: TFields[Key]['errors'] };

export type CreateFormStoreProps<PassedFields extends Record<string, unknown>> =
	{
		initValues: PassedFields;
		isUpdatingFieldsValueOnError?: boolean;
		baseId?: string | boolean;
		trackValidationHistory?: boolean;
		validationEvents?: { [key in ValidationEvents]?: boolean };
		validationHandler?: {
			[Key in keyof PassedFields]?:
				| HandleValidation<PassedFields[Key]>
				| ZodSchema;
		};
		valuesFromFieldsToStore?: {
			[Key in keyof PassedFields]?: (
				fieldValue: string | number,
			) => PassedFields[Key];
		};
		valuesFromStoreToFields?: {
			[Key in keyof PassedFields]?: (
				storeValue: PassedFields[Key],
			) => string | number;
		};
		errorFormatter?: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
	};
