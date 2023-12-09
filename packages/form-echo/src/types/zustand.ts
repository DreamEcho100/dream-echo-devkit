import { type FormStoreShape, type GetValidationValuesFromSchema } from '.';
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

// type TValues = GetFromFieldStore<FormStore>;
// type TSchema = GetFromFieldStore<FormStore, "validationSchemas">;
// type TValidatedValues = GetFromFieldStore<FormStore, "validatedValues">;

// const values = {} as TValues;
// values.category;
// const validationSchemas = {} as TSchema;
// validationSchemas.categoryName;
// const validatedValues = {} as TValidatedValues;
// validatedValues.categoryName;
