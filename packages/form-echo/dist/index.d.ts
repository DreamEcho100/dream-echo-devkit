import { F as FormStoreShape, G as GetValidationValuesFromSchema, C as CreateFormStoreProps } from './fieldValue-b1db7b35.js';
export { c as FieldMetadata, d as FormStoreMetadata, b as FormStoreValidation, f as GetFromFormStoreShape, e as HandleSubmitCB, H as HandleValidation, I as InputDateTypes, V as ValidationEvents, a as ValidationMetadata, g as fvh } from './fieldValue-b1db7b35.js';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';
import { ZodSchema, ZodError } from 'zod';
import 'react';

type FormStoreApi<FieldsValues, ValidationsHandlers = Record<keyof FieldsValues, unknown>> = StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;
type GetFormStoreApiStore<TFormStore, TValueType extends 'values' | 'validationHandlers' | 'validatedValues' = 'values'> = TFormStore extends FormStoreApi<infer FieldsValues, infer ValidationsHandlers> ? TValueType extends 'validationHandlers' ? ValidationsHandlers : TValueType extends 'validatedValues' ? GetValidationValuesFromSchema<ValidationsHandlers> : FieldsValues : never;

declare function isZodValidator(validator: unknown): validator is ZodSchema;
declare function isZodError(error: unknown): error is ZodError;
declare function errorFormatter(error: unknown): string;

declare const handleCreateFormStore: <FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;
declare const useCreateFormStore: <FieldsValues, ValidationsHandlers>(props: Omit<CreateFormStoreProps<FieldsValues, ValidationsHandlers>, "baseId"> & {
    baseId?: string | boolean | undefined;
}) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;

type SetStateInternal<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
declare function createFormStoreBuilder<FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>): (set: SetStateInternal<FormStoreShape<FieldsValues, ValidationsHandlers>>, get: () => FormStoreShape<FieldsValues, ValidationsHandlers>) => FormStoreShape<FieldsValues, ValidationsHandlers>;

export { CreateFormStoreProps, FormStoreApi, FormStoreShape, GetFormStoreApiStore, GetValidationValuesFromSchema, createFormStoreBuilder, errorFormatter, handleCreateFormStore, isZodError, isZodValidator, useCreateFormStore };
