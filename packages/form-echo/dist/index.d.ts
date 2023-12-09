import { F as FormStoreShape, G as GetValidationValuesFromSchema, V as ValidValidationSchema, C as CreateFormStoreProps } from './fieldValue-d4f7241a.js';
export { f as FieldMetadata, g as FormStoreMetadata, h as FormStoreShapeBaseMethods, e as FormStoreValidation, j as GetFromFormStoreShape, i as HandleSubmitCB, b as HandleValidation2, H as HandleValidation2Props, I as InputDateTypes, c as ValidValidationSchemaItem, a as ValidationEvents, d as ValidationMetadata, k as fvh } from './fieldValue-d4f7241a.js';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';
import { ZodSchema, ZodError } from 'zod';
import 'react';

type FormStoreApi<FieldsValues, ValidationSchema = Record<keyof FieldsValues, unknown>> = StoreApi<FormStoreShape<FieldsValues, ValidationSchema>>;
type GetFormStoreApiStore<TFormStore, TValueType extends 'values' | 'validationSchemas' | 'validatedValues' = 'values'> = TFormStore extends FormStoreApi<infer FieldsValues, infer ValidationSchema> ? TValueType extends 'validationSchemas' ? ValidationSchema : TValueType extends 'validatedValues' ? GetValidationValuesFromSchema<ValidationSchema> : FieldsValues : never;

declare function isZodValidator(validator: unknown): validator is ZodSchema;
declare function isZodError(error: unknown): error is ZodError;
declare function errorFormatter(error: unknown): string;

declare const handleCreateFormStore: <FieldsValues, ValidationSchema extends ValidValidationSchema<FieldsValues>>(params: CreateFormStoreProps<FieldsValues, ValidationSchema>) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationSchema>>;
declare const useCreateFormStore: <FieldsValues, ValidationSchema extends ValidValidationSchema<FieldsValues>>(props: Omit<CreateFormStoreProps<FieldsValues, ValidationSchema>, "baseId"> & {
    baseId?: string | boolean | undefined;
}) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationSchema>>;

type SetStateInternal<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
declare function createFormStoreBuilder<FieldsValues, ValidationSchema extends ValidValidationSchema<FieldsValues>>(params: CreateFormStoreProps<FieldsValues, ValidationSchema>): (set: SetStateInternal<FormStoreShape<FieldsValues, ValidationSchema>>, get: () => FormStoreShape<FieldsValues, ValidationSchema>) => FormStoreShape<FieldsValues, ValidationSchema>;

export { CreateFormStoreProps, FormStoreApi, FormStoreShape, GetFormStoreApiStore, GetValidationValuesFromSchema, ValidValidationSchema, createFormStoreBuilder, errorFormatter, handleCreateFormStore, isZodError, isZodValidator, useCreateFormStore };
