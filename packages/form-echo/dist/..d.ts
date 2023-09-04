import { C as CreateFormStoreProps, F as FormStoreShape, T as THandlePreSubmitCB } from './index-a86fc211.js';
export { c as FieldMetadata, d as FormStoreField, e as FormStoreMetadata, b as FormStoreValidation, f as GetFromFormStoreShape, G as GetValidationValuesFromSchema, H as HandleValidation, I as InputDateTypes, V as ValidationEvents, a as ValidationMetadata } from './index-a86fc211.js';
import { FormEvent } from 'react';
import 'zod';

type SetStateInternal<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
declare function CreateFormStoreBuilder<FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>): (set: SetStateInternal<FormStoreShape<FieldsValues, ValidationsHandlers>>) => FormStoreShape<FieldsValues, ValidationsHandlers>;
declare const handlePreSubmit: <FieldsValues, ValidationsHandlers>(storeGetter: () => FormStoreShape<FieldsValues, ValidationsHandlers>, cb: THandlePreSubmitCB<FieldsValues, ValidationsHandlers>) => (event: FormEvent<HTMLFormElement>) => Promise<unknown> | unknown;

export { CreateFormStoreBuilder, CreateFormStoreProps, FormStoreShape, THandlePreSubmitCB, handlePreSubmit };
