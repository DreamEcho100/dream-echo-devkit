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

export type ValidationEvents = 'submit' | 'change'; // | 'mount' | 'blur';

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

	value: Exclude<Value, (value: Value) => Value>;
	isDirty: boolean;
	errors: string[];
	isUpdatingValueOnError: boolean;
	metadata: FieldMetadata<Name, Value>;
	valueFromFieldToStore?: (
		fieldValue: unknown,
	) => Exclude<Value, (value: Value) => Value>;
	valueFromStoreToField?: (StoreValue: Value) => string;
};
export type AllFieldsShape<
	Fields, // = TPassedFieldsShape,
	ValidatedFields, // = undefined,
> = {
	[FieldName in NonNullable<keyof Fields>]: FieldShape<
		FieldName,
		Fields[FieldName],
		ValidatedFields extends Record<FieldName, unknown>
			? ValidatedFields[FieldName]
			: never
	>;
};

export interface FormMetadata<Fields> {
	//  = TPassedFieldsShape
	formId: string;
	fieldsNames: (keyof Fields)[];
}
export interface FormStoreShape<
	Fields, // = TPassedFieldsShape,
	ValidatedFields, // = Record<keyof Fields, unknown>,
> {
	fields: AllFieldsShape<Fields, ValidatedFields>;
	errors: { [Key in keyof Fields]?: string[] | null };
	metadata: FormMetadata<Fields>;
	isTrackingValidationHistory: boolean;
	validations: {
		history: unknown[];
	};
	submitCounter: number;
	utils: {
		handleOnInputChange: (name: keyof Fields, value: unknown) => void;
		errorFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
		reInitFieldsValues: () => void;
		setFieldValue: <Name extends keyof Fields>(
			name: Name,
			value:
				| ((value: Fields[Name]) => Fields[Name])
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				| Exclude<Fields[Name], (...args: any[]) => any>,
		) => void;
		setFieldErrors: (params: {
			name: keyof Fields;
			errors: string[] | null;
			validationEvent: ValidationEvents;
		}) => void;
		createValidationHistoryRecord: (params: {
			validationEvent: ValidationEvents;
			validationEventPhase: 'start' | 'end';
			validationEventState: 'processing' | 'failed' | 'passed';
			fields: AllFieldsShape<Fields, ValidatedFields>[keyof Fields][];
		}) => unknown;
		handleFieldValidation: <Name extends keyof Fields, ValueToCheck>(params: {
			name: Name;
			value: ValueToCheck extends (value: Fields[Name]) => Fields[Name]
				? (value: Fields[Name]) => Fields[Name]
				: ValueToCheck;
			// Exclude<unknown, ((value: Fields[Name]) => Fields[Name])> | ((value: unknown) => Fields[Name]);

			validationEvent: ValidationEvents;
		}) => Exclude<Fields[Name], (value: Fields[Name]) => Fields[Name]>;
		handlePreSubmit: (
			cb?: THandlePreSubmitCB<Fields, ValidatedFields>,
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
	Fields, // = TPassedFieldsShape,
	ValidatedFields = Record<keyof Fields, unknown>,
> = (
	event: FormEvent<HTMLFormElement>,
	params: {
		validatedValues: ValidatedFields;
		values: Fields;
		hasError: boolean;
		errors: {
			[Key in keyof Fields]: {
				name: Key;
				errors: string[] | null;
				validationEvent: ValidationEvents;
			};
		};
	},
) => void;

export type CreateCreateFormStore<
	Fields, // = TPassedFieldsShape,
	ValidatedFields = Record<keyof Fields, unknown>,
> = FormStoreShape<
	{
		[Key in keyof Fields]: Fields[Key];
	},
	ValidatedFields extends NonNullable<ValidatedFields>
		? GetPassedValidationFieldsValues<ValidatedFields>
		: never
>;

export type FormStoreApi<
	Fields, // = TPassedFieldsShape,
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

export type ValidationHandler<Fields = TPassedFieldsShape> = {
	[Key in keyof Fields]?: HandleValidation<Fields[Key]>;
};
export type CreateStoreValidationHandler<
	Fields = TPassedFieldsShape,
	PassedValidationHandler = unknown,
> = {
	[Key in keyof Fields &
		keyof PassedValidationHandler]?: PassedValidationHandler[Key];
};

export type GetFieldsValueFromValidationHandler<
	Fields, // = TPassedFieldsShape,
	PassedValidationHandler = CreateStoreValidationHandler<Fields>,
> = {
	[Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown>
		? ReturnType<PassedValidationHandler[Key]['parse']>
		: PassedValidationHandler[Key] extends HandleValidation<unknown>
		? ReturnType<PassedValidationHandler[Key]>
		: never;
};

export type CreateFormStoreProps<
	Fields, // = TPassedFieldsShape,
	StorePassedValidationHandler = Record<keyof Fields, unknown>,
> = {
	initValues: Fields;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	trackValidationHistory?: boolean;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationSchema: {
		[Key in keyof StorePassedValidationHandler]: StorePassedValidationHandler[Key] extends
			| ZodSchema<unknown>
			| HandleValidation<unknown>
			? StorePassedValidationHandler[Key]
			: never;
	};
	valuesFromFieldsToStore?: {
		[Key in keyof Fields]?: (fieldValue: string) => Fields[Key];
	};
	valuesFromStoreToFields?: {
		[Key in keyof Fields]?: (storeValue: Fields[Key]) => string;
	};
	errorFormatter?: (
		error: unknown,
		validationEvent: ValidationEvents,
	) => string[];
};
