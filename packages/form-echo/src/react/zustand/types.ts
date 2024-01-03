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

export type PropsWithFormStore<FieldsValues, ValidationSchema, Props> =
	Props & {
		store: FormStoreApi<FieldsValues, ValidationSchema>;
	};

export type PropsWithFormStoreForm<FieldsValues, ValidationSchema, Props> =
	PropsWithFormStore<
		FieldsValues,
		ValidationSchema,
		Omit<Props, 'onSubmit'> & {
			onSubmit: HandleSubmitCB<
				FieldsValues,
				ValidationSchema,
				FormEvent<HTMLFormElement>
			>;
		}
	>;

export type PropsWithFormStoreField<FieldsValues, ValidationSchema, Props> =
	PropsWithFormStore<
		FieldsValues,
		ValidationSchema,
		Props & {
			name: keyof FieldsValues;
			validationName?: keyof ValidationSchema;
		}
	>;

export type PropsWithFormStoreValidationField<FieldsValues, ValidationSchema> =
	PropsWithFormStore<
		FieldsValues,
		ValidationSchema,
		| {
				name?: keyof FieldsValues;
				validationName: keyof ValidationSchema;
		  }
		| {
				name: keyof ValidationSchema;
				validationName?: keyof ValidationSchema;
		  }
	>;
