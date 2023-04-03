import type { StoreApi } from 'zustand';

export type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';

export type HandleValidation<Value> = (
	value: unknown,
	validationEvent: ValidationEvents,
) => Value;
export type PassedAllFieldsShape = Record<string, unknown>;
// export type FieldNameShape = string | number | symbol;
export interface FieldMetadata<Name, Value> {
	name: Name;
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
export type FieldShape<Name, Value> = FieldIsDirtyErrorsAndValidation & {
	validation: FieldValidation<Value>;
	value: Value;
	isUpdatingValueOnError: boolean;
	isVisited: boolean;
	isTouched: boolean;
	isDisabled: boolean;
	isHidden: boolean;
	isFocused: boolean;
	isReadOnly: boolean;
	metadata: FieldMetadata<Name, Value>;
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

export type PassesFieldMultiValues<Value = unknown> = {
	value: Value;
	isUpdatingValueOnError?: boolean;
	validationHandler?: HandleValidation<Value>;
	validation?: {
		[key in ValidationEvents]?: boolean;
	};
	valueFromFieldToStore?(fieldValue: unknown): Value;
	valueFromStoreToField?(StoreValue: unknown): unknown;
};

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
		errFormatter: (
			error: unknown,
			validationEvent: ValidationEvents,
		) => string[];
		reInitFieldsValues(): void;
		setFieldValue(
			name: keyof PassedAllFields,
			value: PassedAllFields[keyof PassedAllFields],
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
			value: PassedAllFields[Name];
			validationEvent: ValidationEvents;
		}): PassedAllFields[Name];
	};
}

export type FormStoreApi<Fields extends PassedAllFieldsShape> = StoreApi<
	FormStoreShape<Fields>
>;
