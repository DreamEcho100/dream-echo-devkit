import type FormStoreField from '../form-store-field';
import type { ZodSchema, z } from 'zod';
import type { ErrorFormatter, FormErrorShape } from './_internal';

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
			error: FormError;
	  };

type FormStoreShapeBaseGetMethods<FieldsValues, ValidationSchema> = {
	[Key in 'getValue' | 'getValues']: FormStoreShapeBaseMethods<
		FieldsValues,
		ValidationSchema
	>[Key];
};

export type HandleValidationProps<
	FieldsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> = FormStoreShapeBaseGetMethods<FieldsValues, ValidationSchema> & {
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
export interface HandleValidation<
	FieldsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> {
	(
		params: HandleValidationProps<FieldsValues, ValidationSchema, Key>,
	): ValidationSchema[Key];
}

export type ValidValidationSchemaItem<FieldsValues, Key> =
	| (Key extends keyof FieldsValues
			? HandleValidation<FieldsValues, Record<string, unknown>, Key & string>
			: HandleValidation<FieldsValues, Record<string, unknown>, string>)
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
	handler: HandleValidation<
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
	error: FormError | null;
	isActive: boolean;
}

export type FormError =
	| {
			message: string;
	  }
	| { message: string; path: (string | number)[] }[];

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
	getValues: () => FieldsValues;
	getValue: <Key extends keyof FieldsValues>(
		name: Key,
	) => FieldsValues[typeof name];
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
	handleSubmit: <Event>(
		cb: HandleSubmitCB<FieldsValues, ValidationSchema, Event>,
	) => (event: Event) => Promise<unknown> | unknown;

	errorFormatter: ErrorFormatter;
	setFieldError: (params: FormErrorShape<keyof ValidationSchema>) => void;
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

export interface HandleSubmitCB<FieldsValues, ValidationSchema, Event> {
	(params: {
		event: Event;
		validatedValues: GetValidationValuesFromSchema<ValidationSchema>;
		values: FieldsValues;
		hasError: boolean;
		errors: {
			[Key in keyof ValidationSchema]: {
				name: Key;
				message: string | null;
				validationEvent: ValidationEvents;
			}; // FormErrorShape<Key>;
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
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
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
	valuesFromFieldsToStore?: {
		[Key in keyof FieldsValues]?: (fieldValue: string) => FieldsValues[Key];
	};
	valuesFromStoreToFields?: {
		[Key in keyof FieldsValues]?: (
			storeValue: FieldsValues[Key],
		) => string | ReadonlyArray<string> | number | undefined;
	};
	errorFormatter?: ErrorFormatter;
}
