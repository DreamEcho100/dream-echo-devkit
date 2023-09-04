import type { FormEvent } from 'react';

import type { ZodSchema, z } from 'zod';

import type { StoreApi } from 'zustand';

type TPassedFieldsShape = Record<string, unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any;
type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
	Exclude<{} | null | undefined, TFunction>;

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
export type AllFieldsShape<Fields, ValidatedFields> = {
	[FieldName in NonNullable<keyof Fields>]: FieldShape<
		FieldName,
		Fields[FieldName],
		ValidatedFields extends Record<FieldName, unknown>
			? ValidatedFields[FieldName]
			: never
	>;
};

export interface FormMetadata<Fields, ValidatedFields> {
	baseId?: string;
	formId: string;
	fieldsNames: (keyof Fields)[];
	fieldsNamesMap: Record<keyof Fields, true>;
	//
	validatedFieldsNamesMap: Record<keyof ValidatedFields, true>;
	validatedFieldsNames: (keyof ValidatedFields)[];
	// //
	manualValidatedFields: Exclude<keyof ValidatedFields, keyof Fields>[];
	manualValidatedFieldsMap: Record<
		Exclude<keyof ValidatedFields, keyof Fields>,
		true
	>;
	// //
	referencedValidatedFields: (keyof ValidatedFields & keyof Fields)[];
	referencedValidatedFieldsMap: Record<
		keyof ValidatedFields & keyof Fields,
		true
	>;
}
export interface FormStoreShape<Fields, ValidatedFields> {
	fields: AllFieldsShape<Fields, ValidatedFields>;
	errors: { [Key in keyof Fields]?: string[] | null };
	metadata: FormMetadata<Fields, ValidatedFields>;
	isTrackingValidationHistory: boolean;
	validations: {
		history: unknown[];
	};
	submitCounter: number;
	utils: {
		//
		createValidationHistoryRecord: (params: {
			validationEvent: ValidationEvents;
			validationEventPhase: 'start' | 'end';
			validationEventState: 'processing' | 'failed' | 'passed';
			fields: AllFieldsShape<Fields, ValidatedFields>[keyof Fields][];
		}) => unknown;
		//
		resetFieldsErrors: () => void;
		reInitFieldsValues: () => void;
		setFieldValue: <Name extends keyof Fields>(
			name: Name,
			value: ((value: Fields[Name]) => Fields[Name]) | AnyValueExceptFunctions, // Exclude<Fields[Name], TFunction>,
		) => void;
		handleOnInputChange: <Name extends keyof Fields>(
			name: Name,
			value: AnyValueExceptFunctions | ((value: Fields[Name]) => Fields[Name]),
		) => void;
		errorFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
		setFieldErrors: (params: {
			name: keyof ValidatedFields | keyof Fields; // Fields;
			errors: string[] | null;
			validationEvent: ValidationEvents;
		}) => void;
		//
		handleFieldValidation: <Name extends keyof Fields>(params: {
			name: Name;
			value: AnyValueExceptFunctions | ((value: Fields[Name]) => Fields[Name]); // ???
			validationEvent: ValidationEvents;
		}) => {
			value: Fields[Name];
			validatedValue: AnyValueExceptFunctions;
			// Name extends keyof ValidatedFields
			// ? ValidatedFields[Name]
			// : undefined;
			//AnyValueExceptFunctions | ((value: Fields[Name]) => Fields[Name])
		}; // Exclude<Fields[Name], (value: Fields[Name]) => Fields[Name]>;
		handlePreSubmit: (
			cb?: THandlePreSubmitCB<Fields, ValidatedFields>,
		) => (event: FormEvent<HTMLFormElement>) => unknown | Promise<unknown>;
	};
}

export type GetPassedValidationFieldsValues<PV> = {
	[Key in keyof PV]: PV[Key] extends ZodSchema<unknown>
		? z.infer<PV[Key]>
		: PV[Key] extends (...args: any) => any
		? ReturnType<PV[Key]>
		: PV[Key];

	// PV[Key] extends ZodSchema<unknown>
	// 	? z.infer<PV[Key]>
	// 	: PV[Key] extends HandleValidation<unknown>
	// 	? ReturnType<PV[Key]>
	// 	: undefined;
};

export type HandlePreSubmitCB<Fields, ValidatedField> = THandlePreSubmitCB<
	Fields,
	GetPassedValidationFieldsValues<ValidatedField>
>;

export type THandlePreSubmitCB<Fields, ValidatedFields> = (
	event: FormEvent<HTMLFormElement>,
	params: {
		validatedValues: GetPassedValidationFieldsValues<ValidatedFields>;
		values: Fields;
		hasError: boolean;
		errors: {
			[Key in keyof ValidatedFields]: {
				name: Key;
				errors: string[] | null;
				validationEvent: ValidationEvents;
			};
		};
	},
) => unknown | Promise<unknown>;

export type CreateCreateFormStore<
	Fields,
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
	Fields,
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
	Fields,
	PassedValidationHandler = CreateStoreValidationHandler<Fields>,
> = {
	[Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown>
		? ReturnType<PassedValidationHandler[Key]['parse']>
		: PassedValidationHandler[Key] extends HandleValidation<unknown>
		? ReturnType<PassedValidationHandler[Key]>
		: never;
};

export type CreateFormStoreProps<Fields, StorePassedValidationHandler> = {
	initValues: Fields;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	trackValidationHistory?: boolean;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationSchema: {
		[Key in keyof StorePassedValidationHandler]: Key extends keyof Fields
			? StorePassedValidationHandler[Key] extends
					| ZodSchema<unknown>
					| HandleValidation<unknown>
				? StorePassedValidationHandler[Key]
				: never
			: Key extends Exclude<string, keyof Fields>
			? (fields: Fields, validationEvent: ValidationEvents) => unknown
			: never;
	};
	// & {
	// 	[Key in Exclude<string, keyof Fields>]:
	// 		| ((fields: Fields) => unknown)
	// 		| undefined;
	// };
	valuesFromFieldsToStore?: {
		[Key in keyof Fields]?: (fieldValue: string) => Fields[Key];
	};
	valuesFromStoreToFields?: {
		[Key in keyof Fields]?: (
			storeValue: Fields[Key],
		) => string | ReadonlyArray<string> | number | undefined;
	};
	errorFormatter?: (
		error: unknown,
		validationEvent: ValidationEvents,
	) => string[];
};

// type GetFromFieldStore<
// 	TFormStore,
// 	TValueType extends 'values' | 'schema' | 'validatedValues' = 'values',
// > = TFormStore extends FormStoreApi<infer FromValues, infer FromValidatedValues>
// 	? TValueType extends 'schema'
// 		? FromValidatedValues
// 		: TValueType extends 'validatedValues'
// 		? GetPassedValidationFieldsValues<FromValidatedValues>
// 		: FromValues
// 	: never;

// type TValues = GetFromFieldStore<FormStore>;
// type TSchema = GetFromFieldStore<FormStore, "schema">;
// type TValidatedValues = GetFromFieldStore<FormStore, "validatedValues">;

// const values = {} as TValues;
// values.category;
// const schema = {} as TSchema;
// schema.categoryName;
// const validatedValues = {} as TValidatedValues;
// validatedValues.categoryName;
