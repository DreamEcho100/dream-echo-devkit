import type { FormEvent } from 'react';

import type { ZodSchema } from 'zod';

import type { StoreApi } from 'zustand';

type TPassedFieldsShape = Record<string, unknown>;

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
	handler: HandleValidation<Value>;
	val?: Value;
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
	validation: FieldValidation<ValidatedValue>;

	// eslint-disable-next-line @typescript-eslint/ban-types
	value: Exclude<Value, Function>;
	isDirty: boolean;
	errors: string[];
	isUpdatingValueOnError: boolean;
	metadata: FieldMetadata<Name, Value>;
	valueFromFieldToStore?: (fieldValue: unknown) => Value;
	valueFromStoreToField?: (StoreValue: Value) => string;
};
export type AllFieldsShape<
	PassedFields = TPassedFieldsShape,
	PassedValidatedFields = undefined,
> = {
	[FieldName in NonNullable<keyof PassedFields>]: FieldShape<
		FieldName,
		PassedFields[FieldName],
		PassedValidatedFields extends Record<FieldName, unknown>
			? PassedValidatedFields[FieldName]
			: never
	>;
};

export interface FormMetadata<PassedFields = TPassedFieldsShape> {
	formId: string;
	fieldsNames: (keyof PassedFields)[];
}
export interface FormStoreShape<
	PassedFields = TPassedFieldsShape,
	PassedValidatedFields = Record<keyof PassedFields, unknown>,
> {
	fields: AllFieldsShape<PassedFields, PassedValidatedFields>;
	errors: { [Key in keyof PassedFields]?: string[] | null };
	metadata: FormMetadata<PassedFields>;
	isTrackingValidationHistory: boolean;
	validations: {
		history: unknown[];
	};
	submitCounter: number;
	utils: {
		handleOnInputChange: (name: keyof PassedFields, value: unknown) => void;
		errorFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
		reInitFieldsValues: () => void;
		setFieldValue: (
			name: keyof PassedFields,
			value:
				| ((value: PassedFields[typeof name]) => PassedFields[typeof name])
				| PassedFields[typeof name],
		) => void;
		setFieldErrors: (params: {
			name: keyof PassedFields;
			errors: string[] | null;
			validationEvent: ValidationEvents;
		}) => void;
		createValidationHistoryRecord: (params: {
			validationEvent: ValidationEvents;
			validationEventPhase: 'start' | 'end';
			validationEventState: 'processing' | 'failed' | 'passed';
			fields: AllFieldsShape<
				PassedFields,
				PassedValidatedFields
			>[keyof PassedFields][];
		}) => unknown;
		handleFieldValidation: (params: {
			name: keyof PassedFields;
			value: unknown;
			validationEvent: ValidationEvents;
		}) => PassedFields[keyof PassedFields];
		handlePreSubmit: (
			cb?: THandlePreSubmitCB<PassedFields, PassedValidatedFields>,
		) => (event: FormEvent<HTMLFormElement>) => void;
	};
}

export type GetPassedValidationFieldsValues<PV> = {
	[Key in keyof PV]: PV[Key] extends ZodSchema<unknown>
		? ReturnType<PV[Key]['parse']>
		: PV[Key] extends HandleValidation<unknown>
		? ReturnType<PV[Key]>
		: undefined;
};

export type HandlePreSubmitCB<Fields, ValidatedField> = THandlePreSubmitCB<
	Fields,
	GetPassedValidationFieldsValues<ValidatedField>
>;

export type THandlePreSubmitCB<
	PassedFields = TPassedFieldsShape,
	PassedValidatedFields = Record<keyof PassedFields, unknown>,
> = (
	event: FormEvent<HTMLFormElement>,
	params: {
		validatedValues: PassedValidatedFields;
		values: PassedFields;
		hasError: boolean;
		errors: {
			[Key in keyof PassedFields]: {
				name: Key;
				errors: string[] | null;
				validationEvent: ValidationEvents;
			};
		};
	},
) => void;

export type CreateCreateFormStore<
	PassedFields = TPassedFieldsShape,
	PassedValidatedFields = Record<keyof PassedFields, unknown>,
> = FormStoreShape<
	{
		[Key in keyof PassedFields]: PassedFields[Key];
	},
	PassedValidatedFields extends NonNullable<PassedValidatedFields>
		? GetPassedValidationFieldsValues<PassedValidatedFields>
		: never
>;

export type FormStoreApi<
	Fields = TPassedFieldsShape,
	ValidatedFields = Record<keyof Fields, unknown>,
> = StoreApi<CreateCreateFormStore<Fields, ValidatedFields>>;

export type FormStoreValues<
	Fields = AllFieldsShape<TPassedFieldsShape, Record<string, unknown>>,
> = {
	[Key in keyof Fields]: Fields extends AllFieldsShape<
		TPassedFieldsShape,
		Record<string, unknown>
	>
		? Fields[Key]['value']
		: never;
};

export type FormStoreErrors<
	Fields = AllFieldsShape<TPassedFieldsShape, Record<string, unknown>>,
> = {
	[Key in keyof Fields]: Fields extends AllFieldsShape<
		TPassedFieldsShape,
		Record<string, unknown>
	>
		? Fields[Key]['errors']
		: never;
};

export type ValidationHandler<PassedFields = TPassedFieldsShape> = {
	[Key in keyof PassedFields]?: HandleValidation<PassedFields[Key]>;
};
export type CreateStoreValidationHandler<
	PassedFields = TPassedFieldsShape,
	PassedValidationHandler = unknown,
> = {
	[Key in keyof PassedFields &
		keyof PassedValidationHandler]?: PassedValidationHandler[Key];
};

export type GetFieldsValueFromValidationHandler<
	PassedFields = TPassedFieldsShape,
	PassedValidationHandler = CreateStoreValidationHandler<PassedFields>,
> = {
	[Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown>
		? ReturnType<PassedValidationHandler[Key]['parse']>
		: PassedValidationHandler[Key] extends HandleValidation<unknown>
		? ReturnType<PassedValidationHandler[Key]>
		: never;
};

export type CreateFormStoreProps<
	PassedFields = TPassedFieldsShape,
	StorePassedValidationHandler = Record<keyof PassedFields, unknown>,
> = {
	initValues: PassedFields;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	trackValidationHistory?: boolean;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationHandler: {
		[Key in keyof StorePassedValidationHandler]: StorePassedValidationHandler[Key] extends
			| ZodSchema<unknown>
			| HandleValidation<unknown>
			? StorePassedValidationHandler[Key]
			: never;
	};
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
