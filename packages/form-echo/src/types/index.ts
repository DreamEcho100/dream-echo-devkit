import type FormStoreControl from '~/create-form-store-builder/control';
import type { ZodSchema, z } from 'zod';
import type { ErrorFormatter, FormErrorShape } from './internal';
import type { FormStoreMetadata } from '~/create-form-store-builder/metadata';
import type { FormStoreValidations } from '~/create-form-store-builder/validations';

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

export type ValidationEvents = 'submit' | 'change' | 'focus'; // | 'mount' | 'custom'

type HandleValidationPropsPassedMethodsKeys =
	| 'getControlValue'
	| 'getControlsValues'
	| 'setValidationError'
	| 'setSubmit'
	| 'setControlFocus'
	| 'resetFormStore'
	| 'setControlValue'
	| 'errorFormatter';

type HandleValidationPropsPassedMethods<ControlsValues, ValidationSchema> = {
	[Key in HandleValidationPropsPassedMethodsKeys]: FormStoreShapeBaseMethods<
		ControlsValues,
		ValidationSchema
	>[Key];
};

export type HandleValidationProps<
	ControlsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> = HandleValidationPropsPassedMethods<ControlsValues, ValidationSchema> & {
	validationEvent: ValidationEvents;
	get: () => FormStoreShape<ControlsValues, ValidationSchema>;

	value: Key extends keyof ControlsValues ? ControlsValues[Key] : never;
	name: Key extends keyof ControlsValues ? Key & string : never;
};

export interface HandleValidation<
	ControlsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> {
	(
		params: HandleValidationProps<ControlsValues, ValidationSchema, Key>,
	): ValidationSchema[Key];
}

export type ValidValidationSchemaItem<ControlsValues, Key> =
	| (Key extends keyof ControlsValues
			? HandleValidation<ControlsValues, Record<string, unknown>, Key & string>
			: HandleValidation<ControlsValues, Record<string, unknown>, string>)
	| ZodSchema;
export type ValidValidationSchema<ControlsValues> = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	[Key in keyof ControlsValues | (string & {})]?: ValidValidationSchemaItem<
		ControlsValues,
		Key
	>;
};

export interface ValidationMetadata<Name> {
	name: Name & string;
}
export type FormStoreValidation<
	ControlsValues,
	ValidationSchema,
	Key extends keyof ValidationSchema,
> = {
	// Should always return the validated value
	handler: HandleValidation<ControlsValues, ValidationSchema, Key>;
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
	currentEvent: ValidationEvents | null;
	error: FormError | null;
};

/****************        ****************/
/**************** Controls ****************/
/****************        ****************/
export interface ControlMetadata<Name, Value> {
	name: Name & string;
	initialValue: Value;
}

export interface SubmitState {
	counter: number;
	passedAttempts: number;
	failedAttempts: number;
	error: FormError | null;
	isPending: boolean;
}

export type FormError =
	| {
			message: string;
	  }
	| { message: string; path: (string | number)[] }[];

interface FocusActive<ControlsValues> {
	isPending: true;
	control: { id: string; name: keyof ControlsValues };
}
interface FocusInActive {
	isPending: false;
	control: null;
}
type FocusState<ControlsValues> = FocusActive<ControlsValues> | FocusInActive;

export interface FormStoreShapeBaseMethods<ControlsValues, ValidationSchema> {
	getControlsValues: () => ControlsValues;
	getControlValue: <Key extends keyof ControlsValues>(
		name: Key,
	) => ControlsValues[typeof name];
	setSubmit: (
		valueOrUpdater:
			| Partial<SubmitState>
			| ((value: SubmitState) => Partial<SubmitState>),
	) => void;

	setControlFocus: (
		controlName: keyof ControlsValues,
		validationName:
			| keyof ValidationSchema
			| (typeof controlName & keyof ValidationSchema),
		type: 'in' | 'out',
	) => void;

	resetFormStore: (itemsToReset?: {
		controls?: boolean;
		validations?: boolean;
		submit?: boolean;
		focus?: boolean;
	}) => void;
	setControlValue: <Name extends keyof ControlsValues>(
		name: Name,
		valueOrUpdater:
			| ((value: ControlsValues[Name]) => ControlsValues[Name])
			| AnyValueExceptFunctions,
	) => void;
	handleControlChange: <
		Name extends keyof ControlsValues,
		ValidationName extends keyof ValidationSchema | undefined = undefined,
	>(
		name: Name,
		valueOrUpdater:
			| ((value: ControlsValues[Name]) => ControlsValues[Name])
			| AnyValueExceptFunctions,
		validationName?: ValidationName,
	) => void;
	handleSubmit: <Event>(
		cb: HandleSubmitCB<ControlsValues, ValidationSchema, Event>,
	) => (event: Event) => Promise<unknown> | unknown;

	errorFormatter: ErrorFormatter;
	setValidationError: (params: FormErrorShape<keyof ValidationSchema>) => void;
	getControlEventsListeners: (
		name: keyof ControlsValues,
		validationName?: keyof ValidationSchema,
	) => {
		onChange: (event: { target: { value: string } }) => void;
		onFocus: () => void;
		onBlur: () => void;
	};
}
export interface FormStoreShape<ControlsValues, ValidationSchema>
	extends FormStoreShapeBaseMethods<ControlsValues, ValidationSchema> {
	submit: SubmitState;
	focus: FocusState<ControlsValues>;
	metadata: FormStoreMetadata<ControlsValues, ValidationSchema>;
	validations: FormStoreValidations<ControlsValues, ValidationSchema>;
	controls: {
		[Key in NonNullable<keyof ControlsValues>]: FormStoreControl<
			ControlsValues,
			Key
		>;
	};
}

export interface HandleSubmitCB<ControlsValues, ValidationSchema, Event> {
	(
		params: {
			event: Event;
			validatedValues: GetValidationValuesFromSchema<ValidationSchema>;
			values: ControlsValues;
			get: () => FormStoreShape<ControlsValues, ValidationSchema>;
		} & HandleValidationPropsPassedMethods<ControlsValues, ValidationSchema>,
	): unknown | Promise<unknown>;
}

export type GetFromFormStoreShape<
	TFormStore,
	TValueType extends
		| 'values'
		| 'validationSchemas'
		| 'validatedValues' = 'values',
> = TFormStore extends FormStoreShape<
	infer ControlsValues,
	infer ValidationSchema
>
	? TValueType extends 'validationSchemas'
		? ValidationSchema
		: TValueType extends 'validatedValues'
		? GetValidationValuesFromSchema<ValidationSchema>
		: ControlsValues
	: never;

/****************        ****************/
/************ CreateFormStore ************/
/****************        ****************/
export interface CreateFormStoreProps<
	ControlsValues,
	ValidationSchema, // extends ValidValidationSchema<ControlsValues>,
> {
	initialValues: ControlsValues;
	isUpdatingControlsValueOnError?: boolean;
	baseId?: string;
	validationEvents?: {
		[key in ValidationEvents]?: boolean;
	};
	validationSchema?: ValidationSchema extends ValidValidationSchema<ControlsValues>
		? ValidationSchema
		: undefined;
	valuesFromControlsToStore?: {
		[Key in keyof ControlsValues]?: (
			controlValue: string,
		) => ControlsValues[Key];
	};
	valuesFromStoreToControls?: {
		[Key in keyof ControlsValues]?: (
			storeValue: ControlsValues[Key],
		) => string | ReadonlyArray<string> | number | undefined;
	};
	errorFormatter?: ErrorFormatter;
}
