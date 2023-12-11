import { V as ValidValidationSchema, C as CreateFormStoreProps, F as FormStoreShape } from './field-value-04f1d33b.js';
export { g as FieldMetadata, h as FormStoreMetadata, i as FormStoreShapeBaseMethods, e as FormStoreValidation, k as GetFromFormStoreShape, G as GetValidationValuesFromSchema, j as HandleSubmitCB, b as HandleValidation2, H as HandleValidation2Props, I as InputDateTypes, c as ValidValidationSchemaItem, a as ValidationEvents, d as ValidationMetadata, f as fvh } from './field-value-04f1d33b.js';
import * as zod from 'zod';
import 'react';

/**
 * @param {unknown} validator
 * @returns {validator is import("zod").ZodSchema}
 */
declare function isZodValidator(validator: unknown): validator is zod.ZodType<any, zod.ZodTypeDef, any>;
/**
 * @param {unknown} error
 * @returns {error is import("zod").ZodError}
 */
declare function isZodError(error: unknown): error is zod.ZodError<any>;
/** @param {unknown} error  */
declare function errorFormatter(error: unknown): string;

type SetStateInternal<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
declare function createFormStoreBuilder<FieldsValues, ValidationSchema extends ValidValidationSchema<FieldsValues>>(params: CreateFormStoreProps<FieldsValues, ValidationSchema>): (set: SetStateInternal<FormStoreShape<FieldsValues, ValidationSchema>>, get: () => FormStoreShape<FieldsValues, ValidationSchema>) => FormStoreShape<FieldsValues, ValidationSchema>;

export { CreateFormStoreProps, FormStoreShape, ValidValidationSchema, createFormStoreBuilder, errorFormatter, isZodError, isZodValidator };
