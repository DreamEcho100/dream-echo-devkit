import { type FormStoreShape, type GetValidationValuesFromSchema } from '.';
import type { StoreApi } from 'zustand';

export type FormStoreApi<
	FieldsValues,
	ValidationsHandlers = Record<keyof FieldsValues, unknown>,
> = StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;

export type GetFormStoreApiStore<
	TFormStore,
	TValueType extends
		| 'values'
		| 'validationHandlers'
		| 'validatedValues' = 'values',
> = TFormStore extends FormStoreApi<
	infer FieldsValues,
	infer ValidationsHandlers
>
	? TValueType extends 'validationHandlers'
		? ValidationsHandlers
		: TValueType extends 'validatedValues'
		? GetValidationValuesFromSchema<ValidationsHandlers>
		: FieldsValues
	: never;

// type TValues = GetFromFieldStore<FormStore>;
// type TSchema = GetFromFieldStore<FormStore, "validationHandlers">;
// type TValidatedValues = GetFromFieldStore<FormStore, "validatedValues">;

// const values = {} as TValues;
// values.category;
// const validationHandlers = {} as TSchema;
// validationHandlers.categoryName;
// const validatedValues = {} as TValidatedValues;
// validatedValues.categoryName;
