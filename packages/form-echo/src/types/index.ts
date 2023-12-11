import type FormStoreField from '../form-store-field';
import { type FormEvent } from 'react';
import { type ZodSchema, type z } from 'zod';

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

// Schema extends ZodSchema<unknown>
// 	? z.infer<Schema>
// :
export type GetValidationValuesFromSchema<Schema> = {
	[Key in keyof Schema]: Schema[Key] extends ZodSchema<unknown>
		? z.infer<Schema[Key]>
		: Schema[Key] extends TFunction
		? ReturnType<Schema[Key]>
		: Schema[Key];
};

/****************        ****************/
/************** Validation **************/
/****************        ****************/
export type ValidationEvents = 'submit' | 'change' | 'blur'; // | 'mount' | 'blur';
type ValidationError =
	| { currentEvent: ValidationEvents | null; isDirty: false; error: null }
	| {
			currentEvent: ValidationEvents;
			isDirty: true;
			error: { message: string };
	  };

export type HandleValidation2Props<
	FieldsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> = FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> & {
	validationEvent: ValidationEvents;
	get: () => FormStoreShape<FieldsValues, ValidationSchema>;

	value: Key extends keyof FieldsValues ? FieldsValues[Key] : never;
	name: Key extends keyof FieldsValues ? Key & string : never;
};

// & (Key extends keyof FieldsValues
// 	? {
// 			value: FieldsValues[Key];
// 			name?: Key & string;
// 	  }
// 	: {
// 			value: never;
// 			name: never;
// 	  });
export interface HandleValidation2<
	FieldsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> {
	(
		params: HandleValidation2Props<FieldsValues, ValidationSchema, Key>,
	): ValidationSchema[Key];
}

export type ValidValidationSchemaItem<FieldsValues, Key> =
	| (Key extends keyof FieldsValues
			? HandleValidation2<FieldsValues, Record<string, unknown>, Key & string>
			: HandleValidation2<FieldsValues, Record<string, unknown>, string>)
	| ZodSchema;
export type ValidValidationSchema<FieldsValues> = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	[Key in keyof FieldsValues | (string & {})]?: ValidValidationSchemaItem<
		FieldsValues,
		Key
	>;
};

// export interface HandleValidation<Value> {
// 	(value: unknown, validationEvent: ValidationEvents): Value;
// }

export interface ValidationMetadata<Name> {
	name: Name & string;
}
export type FormStoreValidation<
	FieldsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> = {
	// Should always return the validated value
	handler: HandleValidation2<
		FieldsValues,
		ValidationSchema,
		Key
		// ValidationsValues[Key]
	>;
	// A cleanup function on the utils?
	events: {
		[key in ValidationEvents]: {
			isActive: boolean;
			passedAttempts: number;
			failedAttempts: number;
		};
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
	name: Name & string;
	initialValue: Value;
}

/****************        ****************/
/**********   FormStoreShape   **********/
/****************        ****************/
export interface FormStoreMetadata<FieldsValues, ValidationSchema> {
	fieldsNames: (keyof FieldsValues)[];
	fieldsNamesMap: Record<keyof FieldsValues, true>;
	//
	validatedFieldsNamesMap: Record<keyof ValidationSchema, true>;
	validatedFieldsNames: (keyof ValidationSchema)[];
	//
	manualValidatedFields: Exclude<keyof ValidationSchema, keyof FieldsValues>[];
	manualValidatedFieldsMap: Record<
		Exclude<keyof ValidationSchema, keyof FieldsValues>,
		true
	>;
	//
	referencedValidatedFields: (keyof ValidationSchema & keyof FieldsValues)[];
	referencedValidatedFieldsMap: Record<
		keyof ValidationSchema & keyof FieldsValues,
		true
	>;
}
interface SubmitState {
	counter: number;
	passedAttempts: number;
	failedAttempts: number;
	errorMessage: string | null;
	isActive: boolean;
}

interface FocusActive<FieldsValues> {
	isActive: true;
	field: { id: string; name: keyof FieldsValues };
}
interface FocusInActive {
	isActive: false;
	field: null;
}
type FocusState<FieldsValues> = FocusActive<FieldsValues> | FocusInActive;

export interface FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> {
	getValues(): FieldsValues;
	getValue<Key extends keyof FieldsValues>(
		name: Key,
	): FieldsValues[typeof name];
	setSubmitState: (
		valueOrUpdater:
			| Partial<SubmitState>
			| ((value: SubmitState) => Partial<SubmitState>),
	) => void;
	setFocusState: (
		fieldName: keyof FieldsValues,
		validationName:
			| keyof ValidationSchema
			| (keyof FieldsValues & keyof ValidationSchema),
		isActive: boolean,
	) => void;
	resetFormStore: (itemsToReset?: {
		fields?: boolean;
		validations?: boolean;
		submit?: boolean;
		focus?: boolean;
	}) => void;
	setFieldValue: <Name extends keyof FieldsValues>(
		name: Name,
		valueOrUpdater:
			| ((value: FieldsValues[Name]) => FieldsValues[Name])
			| AnyValueExceptFunctions,
	) => void;
	handleInputChange: <
		Name extends keyof FieldsValues,
		ValidationName extends keyof ValidationSchema | undefined = undefined,
	>(
		name: Name,
		valueOrUpdater:
			| ((value: FieldsValues[Name]) => FieldsValues[Name])
			| AnyValueExceptFunctions,
		validationName?: ValidationName,
	) => void;
	handleSubmit: (
		cb: HandleSubmitCB<FieldsValues, ValidationSchema>,
	) => (event: FormEvent<HTMLFormElement>) => Promise<unknown> | unknown;

	errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string;
	setFieldError: (params: {
		name: keyof ValidationSchema;
		message: string | null;
		validationEvent: ValidationEvents;
	}) => void;
	getFieldEventsListeners: (
		name: keyof FieldsValues,
		validationName?: keyof ValidationSchema,
	) => {
		onChange: (event: { target: { value: string } }) => void;
		onFocus: () => void;
		onBlur: () => void;
	};
}
export interface FormStoreShape<FieldsValues, ValidationSchema>
	extends FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> {
	submit: SubmitState;
	currentDirtyFieldsCounter: number;
	isDirty: boolean;
	baseId: string;
	id: string;

	focus: FocusState<FieldsValues>;

	metadata: FormStoreMetadata<FieldsValues, ValidationSchema>;
	validations: {
		[Key in keyof GetValidationValuesFromSchema<ValidationSchema>]: FormStoreValidation<
			FieldsValues,
			ValidationSchema,
			// GetValidationValuesFromSchema<ValidationSchema>,
			Key
		>;
	};
	fields: {
		[Key in NonNullable<keyof FieldsValues>]: FormStoreField<FieldsValues, Key>;
	};
	_baseMethods: FormStoreShapeBaseMethods<FieldsValues, ValidationSchema>;
}

export interface HandleSubmitCB<FieldsValues, ValidationSchema> {
	(params: {
		event: FormEvent<HTMLFormElement>;
		validatedValues: GetValidationValuesFromSchema<ValidationSchema>;
		values: FieldsValues;
		hasError: boolean;
		errors: {
			[Key in keyof ValidationSchema]: {
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
		| 'validationSchemas'
		| 'validatedValues' = 'values',
> = TFormStore extends FormStoreShape<
	infer FieldsValues,
	infer ValidationSchema
>
	? TValueType extends 'validationSchemas'
		? ValidationSchema
		: TValueType extends 'validatedValues'
		? GetValidationValuesFromSchema<ValidationSchema>
		: FieldsValues
	: never;

/****************        ****************/
/************ CreateFormStore ************/
/****************        ****************/
export interface CreateFormStoreProps<
	FieldsValues,
	// eslint-disable-next-line @typescript-eslint/ban-types
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
	// | undefined = undefined, // Record<keyof FieldsValues | (string & {}), unknown>,
> {
	initialValues: FieldsValues;
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string | boolean;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationSchema?: ValidationSchema extends ValidValidationSchema<FieldsValues>
		? ValidationSchema
		: undefined;
	// {
	// 	[Key in keyof ValidationSchema]:
	// 		| HandleValidation2<FieldsValues, ValidationSchema, Key>
	// 		| ZodSchema<unknown>;
	// 	/*
	// 	Key extends keyof FieldsValues
	// 		? ValidationSchema[Key] extends
	// 				| ZodSchema<unknown>
	// 				| HandleValidation<unknown>
	// 			? ValidationSchema[Key]
	// 			: never
	// 		: Key extends Exclude<string, keyof FieldsValues>
	// 		? (fields: FieldsValues, validationEvent: ValidationEvents) => unknown
	// 		: never;
	// 		*/
	// };
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
