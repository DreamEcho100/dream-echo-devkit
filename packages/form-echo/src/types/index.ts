import { type FormEvent } from 'react';
import { type ZodSchema, type z } from 'zod';

export * from './zustand';

// type TPassedFieldsShape = Record<string, unknown>;
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
	| { isDirty: false; message: null }
	| { isDirty: true; message: string };
export type ValidationEvents = 'submit' | 'change'; // | 'mount' | 'blur';
export type HandleValidation<Value> = (
	value: unknown,
	validationEvent: ValidationEvents,
) => Value;
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
			isDirty: boolean;
			isActive: boolean;
			passedAttempts: number;
			failedAttempts: number;
		} & ValidationError;
	};
	isDirty: boolean;
	currentDirtyEventsCounter: number;
	passedAttempts: number;
	failedAttempts: number;
	metadata: ValidationMetadata<Key>;
};

/****************        ****************/
/**************** Fields ****************/
/****************        ****************/
export interface FieldMetadata<Name, Value> {
	/* readonly */ name: Name & string;
	/* readonly */ initialValue: Value;
}
export type FormStoreField<FieldsValues, Key extends keyof FieldsValues> = {
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
};

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
	fields: { [Key in keyof FieldsValues]: FormStoreField<FieldsValues, Key> };
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
			// ValueOrUpdaterSanitized<
			// 	ValueOrUpdater,
			// 	FieldsValues[Name]
			// >, //  FieldsValues[Name] | ((value: FieldsValues[Name]) => FieldsValues[Name])
		) => void;
		// 	typeof valueOrUpdater extends (
		// 	value: FieldsValues[Name],
		// ) => FieldsValues[Name]
		// 	? ReturnType<typeof valueOrUpdater>
		// 	: typeof valueOrUpdater;
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
			name: keyof ValidationsHandlers; // Fields;
			error: string | null;
			validationEvent: ValidationEvents;
		}) => void;
		// handleFieldValidation: <Name extends keyof FieldsValues>(params: {
		// 	name: Name;
		// 	value: AnyValueExceptFunctions | ((value: FieldsValues[Name]) => FieldsValues[Name]); // ???
		// 	validationEvent: ValidationEvents;
		// }) => {
		// 	value: FieldsValues[Name];
		// 	validatedValue: AnyValueExceptFunctions;
		// };
	};
}

// export type HandleSubmit = <FieldsValues, ValidationsHandlers>(
// 	storeGetter: () => FormStoreShape<FieldsValues, ValidationsHandlers>,
// 	cb: HandleSubmitCB<FieldsValues, ValidationsHandlers>,
// ) => (event: FormEvent<HTMLFormElement>) => unknown | Promise<unknown>;

// export type GetPassedValidationFieldsValues<ValidationsHandlers> = {
// 	[Key in keyof ValidationsHandlers]: ValidationsHandlers[Key] extends ZodSchema<unknown>
// 		? z.infer<ValidationsHandlers[Key]>
// 		: ValidationsHandlers[Key] extends TFunction
// 		? ReturnType<ValidationsHandlers[Key]>
// 		: ValidationsHandlers[Key];
// };
export type HandleSubmitCB<FieldsValues, ValidationsHandlers> = (params: {
	event: FormEvent<HTMLFormElement>;
	validatedValues: GetValidationValuesFromSchema<ValidationsHandlers>;
	values: FieldsValues;
	hasError: boolean;
	errors: {
		[Key in keyof ValidationsHandlers]: {
			name: Key;
			error: string | null;
			validationEvent: ValidationEvents;
		};
	};
}) => unknown | Promise<unknown>;
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
export type CreateFormStoreProps<
	FieldsValues,
	ValidationsHandlers = Record<keyof FieldsValues, unknown>,
> = {
	initValues: FieldsValues;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	trackValidationHistory?: boolean;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationsSchema: {
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
};

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
