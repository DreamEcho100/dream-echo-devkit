import type { StoreApi } from 'zustand';

export type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';

/*
Basic types shapes to extend from or use as a generic
*/
export type HandleValidation<Value> = (value: unknown) => Value;
export type PassedAllFieldsShape = Record<string, unknown>;
export type FieldNameShape = string | number | symbol;
export interface FieldMetadata<Name extends FieldNameShape, Value> {
	name: Name;
	id: string;
	initialValue: Value;
}
export interface FieldValidation<Value> {
	defaultHandler?(): HandleValidation<Value>;
	events: {
		[key in ValidationEvents]: {
			isActive: boolean;
			handler?(): HandleValidation<Value>;
			counter: { passed: number; failed: number };
		};
	};
	counter: { passed: number; failed: number };
}
export interface FieldIsDirtyErrorsAndValidationShape<
	Value,
	IsDirty extends boolean,
	Errors extends string[] | null,
> {
	isDirty: IsDirty;
	validation: FieldValidation<Value> & { errors: Errors };
}
export type FieldIsDirtyErrorsAndValidation<Value> =
	| FieldIsDirtyErrorsAndValidationShape<Value, false, null>
	| FieldIsDirtyErrorsAndValidationShape<Value, true, string[]>;
export type FieldShape<
	Name extends FieldNameShape,
	Value extends unknown,
> = FieldIsDirtyErrorsAndValidation<Value> & {
	value: Value;
	isTouched: boolean;
	isVisited: boolean;
	metadata: FieldMetadata<Name, Value>;
};
export type AllFieldsShape<PassedAllFields extends PassedAllFieldsShape> = {
	// Exclude<keyof PassedAllFields, symbol>
	[FieldName in keyof PassedAllFields]: FieldShape<
		FieldName,
		PassedAllFields[FieldName]
	>;
};

export interface FormMetadata<PassedAllFields extends PassedAllFieldsShape> {
	id: string;
	fieldsNames: (keyof PassedAllFields)[];
}

export interface FormStoreShape<PassedAllFields extends PassedAllFieldsShape> {
	fields: AllFieldsShape<PassedAllFields>;
	form: {
		errors: {
			[Key in keyof PassedAllFields]?: string[];
		};
		metadata: FormMetadata<PassedAllFields>;
		submitCounter: number;
		// ...other properties of your form store
	};
}

export type FormStoreApi<TFields extends PassedAllFieldsShape> = StoreApi<
	FormStoreShape<TFields>
>;

// const formStore = {} as FormStore<{
// 	username: string;
// 	email: string;
// 	dateOfBirth: Date;
// }>;

// formStore.fields.dateOfBirth.value;

// if (formStore.fields.dateOfBirth.isDirty)
// 	formStore.fields.dateOfBirth.validation.errors;
// else formStore.fields.dateOfBirth.validation.errors;

// formStore.fields.dateOfBirth.validation.events.blur;
// formStore.fields.dateOfBirth.validation.events.blur.counter.failed;
