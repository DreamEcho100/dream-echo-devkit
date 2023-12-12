import type { FormEvent } from 'react';
import type {
	FormStoreShape,
	GetValidationValuesFromSchema,
	HandleSubmitCB,
} from '../../types';
import type { StoreApi } from 'zustand';

export type FormStoreApi<
	FieldsValues,
	ValidationSchema = Record<keyof FieldsValues, unknown>,
> = StoreApi<FormStoreShape<FieldsValues, ValidationSchema>>;

export type GetFormStoreApiStore<
	TFormStore,
	TValueType extends
		| 'values'
		| 'validationSchemas'
		| 'validatedValues' = 'values',
> = TFormStore extends FormStoreApi<infer FieldsValues, infer ValidationSchema>
	? TValueType extends 'validationSchemas'
		? ValidationSchema
		: TValueType extends 'validatedValues'
		? GetValidationValuesFromSchema<ValidationSchema>
		: FieldsValues
	: never;

export type FormStoreProps<FieldsValues, ValidationSchema> = {
	store: FormStoreApi<FieldsValues, ValidationSchema>;
};

export type FormStoreFormProps<FieldsValues, ValidationSchema> = {
	onSubmit: HandleSubmitCB<
		FieldsValues,
		ValidationSchema,
		FormEvent<HTMLFormElement>
	>;
} & FormStoreProps<FieldsValues, ValidationSchema>;

export type FormStoreFieldProps<FieldsValues, ValidationSchema> = {
	name: keyof FieldsValues;
	validationName?: keyof ValidationSchema;
} & FormStoreProps<FieldsValues, ValidationSchema>;
export type FormStoreValidationProps<FieldsValues, ValidationSchema> = (
	| {
			name?: keyof FieldsValues;
			validationName: keyof ValidationSchema;
	  }
	| {
			name: keyof ValidationSchema;
			validationName?: keyof ValidationSchema;
	  }
) &
	FormStoreProps<FieldsValues, ValidationSchema>;
