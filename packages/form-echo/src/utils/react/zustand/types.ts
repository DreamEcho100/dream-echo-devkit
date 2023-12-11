import type {
	FormStoreShape,
	GetValidationValuesFromSchema,
} from '../../../types';
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
