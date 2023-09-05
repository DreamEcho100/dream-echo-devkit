import { type FormEvent } from 'react';
import { type ZodSchema, type z } from 'zod';

export * from './zustand';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any;
type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
	Exclude<{} | null | undefined, TFunction>;
// type ValueOrUpdaterSanitized<ValueOrUpdater, DesiredValue> =
// 	ValueOrUpdater extends TFunction
// 		? (value: DesiredValue) => DesiredValue
// 		: // : ValueOrUpdater extends TFunction
// 		  // ? never
// 		  ValueOrUpdater;

export type InputDateTypes =
	| 'date'
	| 'time'
	| 'datetime-local'
	| 'week'
	| 'month';

export type GetValidationValuesFromSchema<Handler> = {
	[Key in keyof Handler]: Handler[Key] extends ZodSchema<unknown>
		? z.infer<Handler[Key]>
		: Handler[Key] extends TFunction
		? ReturnType<Handler[Key]>
		: Handler[Key];
};

/****************        ****************/
/************** Validation **************/
/****************        ****************/
type ValidationError =
	| { isDirty: false; error: null }
	| { isDirty: true; error: { message: string } };
export type ValidationEvents = 'submit' | 'change'; // | 'mount' | 'blur';
export interface HandleValidation<Value> {
	(value: unknown, validationEvent: ValidationEvents): Value;
}
/*
export type HandleValidation2<FieldsValues, Key, Value> =
	Key extends keyof FieldsValues
		? (params: { value: unknown; validationEvent: ValidationEvents }) => Value
		: (params: {
				fields: FieldsValues;
				validationEvent: ValidationEvents;
		  }) => Value;
			*/

export interface ValidationMetadata<Name> {
	/* readonly */ name: Name & string;
}
export type FormStoreValidation<
	ValidationsValues,
	Key extends keyof ValidationsValues,
> = {
	// Should always return the validated value
	handler: HandleValidation<ValidationsValues[Key]>;
	// A cleanup function on the utils?
	events: {
		[key in ValidationEvents]: {
			isActive: boolean;
			passedAttempts: number;
			failedAttempts: number;
		} & ValidationError;
	};
	currentDirtyEventsCounter: number;
	passedAttempts: number;
	failedAttempts: number;
	metadata: ValidationMetadata<Key>;
} & ValidationError;

/****************        ****************/
/**************** Fields ****************/
/****************        ****************/
export interface FieldMetadata<Name, Value> {
	/* readonly */ name: Name & string;
	/* readonly */ initialValue: Value;
}
export interface FormStoreField<FieldsValues, Key extends keyof FieldsValues> {
	id: string;
	value: FieldsValues[Key];
	metadata: FieldMetadata<Key, FieldsValues[Key]>;
	isUpdatingValueOnError: boolean;
	valueFromFieldToStore?: (
		fieldValue: unknown,
	) => Exclude<
		FieldsValues[Key],
		(value: FieldsValues[Key]) => FieldsValues[Key]
	>;
	valueFromStoreToField?: (StoreValue: FieldsValues[Key]) => string;
}

/****************        ****************/
/**********   FormStoreShape   **********/
/****************        ****************/
export interface FormStoreMetadata<FieldsValues, ValidationsHandlers> {
	// originalValidationsHandlers: ValidationsHandlers;
	/* readonly */ fieldsNames: (keyof FieldsValues)[];
	/* readonly */ fieldsNamesMap: Record<keyof FieldsValues, true>;
	//
	/* readonly */ validatedFieldsNamesMap: Record<
		keyof ValidationsHandlers,
		true
	>;
	/* readonly */ validatedFieldsNames: (keyof ValidationsHandlers)[];
	// //
	/* readonly */ manualValidatedFields: Exclude<
		keyof ValidationsHandlers,
		keyof FieldsValues
	>[];
	/* readonly */ manualValidatedFieldsMap: Record<
		Exclude<keyof ValidationsHandlers, keyof FieldsValues>,
		true
	>;
	// //
	/* readonly */ referencedValidatedFields: (keyof ValidationsHandlers &
		keyof FieldsValues)[];
	/* readonly */ referencedValidatedFieldsMap: Record<
		keyof ValidationsHandlers & keyof FieldsValues,
		true
	>;
}
export interface FormStoreShape<FieldsValues, ValidationsHandlers> {
	submitCounter: number;
	currentDirtyFieldsCounter: number;
	isSubmitting: boolean;
	isDirty: boolean;
	baseId: string;
	id: string;
	metadata: FormStoreMetadata<FieldsValues, ValidationsHandlers>;
	validations: {
		[Key in keyof GetValidationValuesFromSchema<ValidationsHandlers>]: FormStoreValidation<
			GetValidationValuesFromSchema<ValidationsHandlers>,
			Key
		>;
	};
	fields: {
		[Key in NonNullable<keyof FieldsValues>]: FormStoreField<FieldsValues, Key>;
	};
	utils: {
		setIsSubmitting: (
			valueOrUpdater: boolean | ((value: boolean) => boolean),
		) => void;
		resetFormStore: (itemsToReset?: {
			fields?: boolean;
			validations?: boolean;
			submitCounter?: boolean;
		}) => void;
		setFieldValue: <Name extends keyof FieldsValues>(
			name: Name,
			valueOrUpdater:
				| ((value: FieldsValues[Name]) => FieldsValues[Name])
				| AnyValueExceptFunctions,
		) => void;
		handleOnInputChange: <
			Name extends keyof FieldsValues,
			ValidationName extends keyof ValidationsHandlers | undefined = undefined,
		>(
			name: Name,
			valueOrUpdater:
				| ((value: FieldsValues[Name]) => FieldsValues[Name])
				| AnyValueExceptFunctions,
			validationName?: ValidationName,
		) => void;
		handleSubmit: (
			cb: HandleSubmitCB<FieldsValues, ValidationsHandlers>,
		) => (event: FormEvent<HTMLFormElement>) => Promise<unknown> | unknown;

		errorFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string;
		setFieldErrors: (params: {
			name: keyof ValidationsHandlers;
			message: string | null;
			validationEvent: ValidationEvents;
		}) => void;
	};
}
export interface HandleSubmitCB<FieldsValues, ValidationsHandlers> {
	(params: {
		event: FormEvent<HTMLFormElement>;
		validatedValues: GetValidationValuesFromSchema<ValidationsHandlers>;
		values: FieldsValues;
		hasError: boolean;
		errors: {
			[Key in keyof ValidationsHandlers]: {
				name: Key;
				message: string | null;
				validationEvent: ValidationEvents;
			};
		};
	}): unknown | Promise<unknown>;
}

export type GetFromFormStoreShape<
	TFormStore,
	TValueType extends
		| 'values'
		| 'validationHandlers'
		| 'validatedValues' = 'values',
> = TFormStore extends FormStoreShape<
	infer FieldsValues,
	infer ValidationsHandlers
>
	? TValueType extends 'validationHandlers'
		? ValidationsHandlers
		: TValueType extends 'validatedValues'
		? GetValidationValuesFromSchema<ValidationsHandlers>
		: FieldsValues
	: never;

/****************        ****************/
/************ CreateFormStore ************/
/****************        ****************/
export interface CreateFormStoreProps<
	FieldsValues,
	ValidationsHandlers = Record<keyof FieldsValues, unknown>,
> {
	initialValues: FieldsValues;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationsHandlers: {
		[Key in keyof ValidationsHandlers]: Key extends keyof FieldsValues
			? ValidationsHandlers[Key] extends
					| ZodSchema<unknown>
					| HandleValidation<unknown>
				? ValidationsHandlers[Key]
				: never
			: Key extends Exclude<string, keyof FieldsValues>
			? (fields: FieldsValues, validationEvent: ValidationEvents) => unknown
			: never;
	};
	valuesFromFieldsToStore?: {
		[Key in keyof FieldsValues]?: (fieldValue: string) => FieldsValues[Key];
	};
	valuesFromStoreToFields?: {
		[Key in keyof FieldsValues]?: (
			storeValue: FieldsValues[Key],
		) => string | ReadonlyArray<string> | number | undefined;
	};
	errorFormatter?: (
		error: unknown,
		validationEvent: ValidationEvents,
	) => string;
}

// export type CreateFormStore<
// 	Fields,
// 	ValidatedFields = Record<keyof Fields, unknown>,
// > = FormStoreShape<
// 	Fields,
// 	ValidatedFields extends NonNullable<ValidatedFields>
// 		? GetValidationValuesFromSchema<ValidatedFields>
// 		: never
// >;

// const ttt: TFunction = function () {
// 	// () => void
// } satisfies AnyValueExceptFunctions;
// ttt;

// const t = ((value: string) => value) satisfies ValueOrUpdaterSanitized<
// 	(value: string) => string,
// 	string
// >;
// t;
