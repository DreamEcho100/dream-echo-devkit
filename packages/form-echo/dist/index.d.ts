import { FormEvent } from 'react';
import { ZodSchema, z, ZodError } from 'zod';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';

type FormStoreApi<FieldsValues, ValidationsHandlers = Record<keyof FieldsValues, unknown>> = StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;
type GetFormStoreApiStore<TFormStore, TValueType extends 'values' | 'validationHandlers' | 'validatedValues' = 'values'> = TFormStore extends FormStoreApi<infer FieldsValues, infer ValidationsHandlers> ? TValueType extends 'validationHandlers' ? ValidationsHandlers : TValueType extends 'validatedValues' ? GetValidationValuesFromSchema<ValidationsHandlers> : FieldsValues : never;

type TFunction = (...args: any[]) => any;
type AnyValueExceptFunctions = Exclude<{} | null | undefined, TFunction>;
type InputDateTypes = 'date' | 'time' | 'datetime-local' | 'week' | 'month';
type GetValidationValuesFromSchema<Handler> = {
    [Key in keyof Handler]: Handler[Key] extends ZodSchema<unknown> ? z.infer<Handler[Key]> : Handler[Key] extends TFunction ? ReturnType<Handler[Key]> : Handler[Key];
};
/****************        ****************/
/************** Validation **************/
/****************        ****************/
type ValidationError = {
    isDirty: false;
    error: null;
} | {
    isDirty: true;
    error: {
        message: string;
    };
};
type ValidationEvents = 'submit' | 'change';
interface HandleValidation<Value> {
    (value: unknown, validationEvent: ValidationEvents): Value;
}
interface ValidationMetadata<Name> {
    name: Name & string;
}
type FormStoreValidation<ValidationsValues, Key extends keyof ValidationsValues> = {
    handler: HandleValidation<ValidationsValues[Key]>;
    events: {
        [key in ValidationEvents]: {
            isActive: boolean;
            passedAttempts: number;
            failedAttempts: number;
        } & ValidationError;
    };
    currentDirtyEventsCounter: number;
    passedAttempts: number;
    failedAttempts: number;
    metadata: ValidationMetadata<Key>;
} & ValidationError;
/****************        ****************/
/**************** Fields ****************/
/****************        ****************/
interface FieldMetadata<Name, Value> {
    name: Name & string;
    initialValue: Value;
}
interface FormStoreField<FieldsValues, Key extends keyof FieldsValues> {
    id: string;
    value: FieldsValues[Key];
    metadata: FieldMetadata<Key, FieldsValues[Key]>;
    isUpdatingValueOnError: boolean;
    valueFromFieldToStore?: (fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>;
    valueFromStoreToField?: (StoreValue: FieldsValues[Key]) => string;
}
/****************        ****************/
/**********   FormStoreShape   **********/
/****************        ****************/
interface FormStoreMetadata<FieldsValues, ValidationsHandlers> {
    fieldsNames: (keyof FieldsValues)[];
    fieldsNamesMap: Record<keyof FieldsValues, true>;
    validatedFieldsNamesMap: Record<keyof ValidationsHandlers, true>;
    validatedFieldsNames: (keyof ValidationsHandlers)[];
    manualValidatedFields: Exclude<keyof ValidationsHandlers, keyof FieldsValues>[];
    manualValidatedFieldsMap: Record<Exclude<keyof ValidationsHandlers, keyof FieldsValues>, true>;
    referencedValidatedFields: (keyof ValidationsHandlers & keyof FieldsValues)[];
    referencedValidatedFieldsMap: Record<keyof ValidationsHandlers & keyof FieldsValues, true>;
}
interface FormStoreShape<FieldsValues, ValidationsHandlers> {
    submitCounter: number;
    currentDirtyFieldsCounter: number;
    isSubmitting: boolean;
    isDirty: boolean;
    baseId: string;
    id: string;
    metadata: FormStoreMetadata<FieldsValues, ValidationsHandlers>;
    validations: {
        [Key in keyof GetValidationValuesFromSchema<ValidationsHandlers>]: FormStoreValidation<GetValidationValuesFromSchema<ValidationsHandlers>, Key>;
    };
    fields: {
        [Key in keyof FieldsValues]: FormStoreField<FieldsValues, Key>;
    };
    utils: {
        setIsSubmitting: (valueOrUpdater: boolean | ((value: boolean) => boolean)) => void;
        resetFormStore: (itemsToReset?: {
            fields?: boolean;
            validations?: boolean;
            submitCounter?: boolean;
        }) => void;
        setFieldValue: <Name extends keyof FieldsValues>(name: Name, valueOrUpdater: ((value: FieldsValues[Name]) => FieldsValues[Name]) | AnyValueExceptFunctions) => void;
        handleOnInputChange: <Name extends keyof FieldsValues, ValidationName extends keyof ValidationsHandlers | undefined = undefined>(name: Name, valueOrUpdater: ((value: FieldsValues[Name]) => FieldsValues[Name]) | AnyValueExceptFunctions, validationName?: ValidationName) => void;
        handleSubmit: (cb: HandleSubmitCB<FieldsValues, ValidationsHandlers>) => (event: FormEvent<HTMLFormElement>) => Promise<unknown> | unknown;
        errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string;
        setFieldErrors: (params: {
            name: keyof ValidationsHandlers;
            message: string | null;
            validationEvent: ValidationEvents;
        }) => void;
    };
}
interface HandleSubmitCB<FieldsValues, ValidationsHandlers> {
    (params: {
        event: FormEvent<HTMLFormElement>;
        validatedValues: GetValidationValuesFromSchema<ValidationsHandlers>;
        values: FieldsValues;
        hasError: boolean;
        errors: {
            [Key in keyof ValidationsHandlers]: {
                name: Key;
                error: string | null;
                validationEvent: ValidationEvents;
            };
        };
    }): unknown | Promise<unknown>;
}
type GetFromFormStoreShape<TFormStore, TValueType extends 'values' | 'validationHandlers' | 'validatedValues' = 'values'> = TFormStore extends FormStoreShape<infer FieldsValues, infer ValidationsHandlers> ? TValueType extends 'validationHandlers' ? ValidationsHandlers : TValueType extends 'validatedValues' ? GetValidationValuesFromSchema<ValidationsHandlers> : FieldsValues : never;
/****************        ****************/
/************ CreateFormStore ************/
/****************        ****************/
interface CreateFormStoreProps<FieldsValues, ValidationsHandlers = Record<keyof FieldsValues, unknown>> {
    initValues: FieldsValues;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    trackValidationHistory?: boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationsSchema: {
        [Key in keyof ValidationsHandlers]: Key extends keyof FieldsValues ? ValidationsHandlers[Key] extends ZodSchema<unknown> | HandleValidation<unknown> ? ValidationsHandlers[Key] : never : Key extends Exclude<string, keyof FieldsValues> ? (fields: FieldsValues, validationEvent: ValidationEvents) => unknown : never;
    };
    valuesFromFieldsToStore?: {
        [Key in keyof FieldsValues]?: (fieldValue: string) => FieldsValues[Key];
    };
    valuesFromStoreToFields?: {
        [Key in keyof FieldsValues]?: (storeValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
    };
    errorFormatter?: (error: unknown, validationEvent: ValidationEvents) => string;
}

/**
 * Formats a date object to the desired string format based on the type.
 * @param {Date} date - The Date object to be formatted.
 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
 * @returns {string} A formatted string based on the specified format.
 */
declare function formatDate(date: Date, type: InputDateTypes): string;
/**
 * Parses a string in the specified format and returns a Date object.
 * @param {string} dateString - The string to be parsed.
 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
 * @returns {Date} - The parsed Date object.
 */
declare function parseDate(dateString: string | number, type: InputDateTypes): Date;
/**
 * Returns the week number of the year for a given date.
 * @param {Date} date - The date object for which to calculate the week number.
 * @returns {number} - The week number.
 */
declare function getWeekNumber(date: Date): number;
/**
 * Returns the first date (Monday) of a given week in a year.
 * @param {number} year - The year of the target week.
 * @param {number} week - The week number (1-53) of the desired week.
 * @returns {Date} - The first date (Monday) of the specified week.
 */
declare function getFirstDateOfWeek(year: number, week: number): Date;
/**
 * A collection of helper functions for working with input date values.
 * @namespace
 */
declare const inputDateHelpers: {
    /**
     * Formats a date object to the desired string format based on the type.
     * @param {Date} date - The Date object to be formatted.
     * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
     * @returns {string} A formatted string based on the specified format.
     */
    formatDate: typeof formatDate;
    /**
     * Parses a string in the specified format and returns a Date object.
     * @param {string} dateString - The string to be parsed.
     * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
     * @returns {Date} - The parsed Date object.
     */
    parseDate: typeof parseDate;
    /**
     * Returns the week number of the year for a given date.
     * @param {Date} date - The date object for which to calculate the week number.
     * @returns {number} - The week number.
     */
    getWeekNumber: typeof getWeekNumber;
    /**
     * Returns the first date (Monday) of a given week in a year.
     * @param {number} year - The year of the target week.
     * @param {number} week - The week number (1-53) of the desired week.
     * @returns {Date} - The first date (Monday) of the specified week.
     */
    getFirstDateOfWeek: typeof getFirstDateOfWeek;
};

declare function isZodValidator(validator: unknown): validator is ZodSchema;
declare function isZodError(error: unknown): error is ZodError;
declare function errorFormatter(error: unknown): string;

declare const handleCreateFormStore: <FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;
declare const useCreateFormStore: <FieldsValues, ValidationsHandlers>(props: Omit<CreateFormStoreProps<FieldsValues, ValidationsHandlers>, "baseId"> & {
    baseId?: string | boolean | undefined;
}) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;

type SetStateInternal<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
declare function createFormStoreBuilder<FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>): (set: SetStateInternal<FormStoreShape<FieldsValues, ValidationsHandlers>>, get: () => FormStoreShape<FieldsValues, ValidationsHandlers>) => FormStoreShape<FieldsValues, ValidationsHandlers>;

export { CreateFormStoreProps, FieldMetadata, FormStoreApi, FormStoreField, FormStoreMetadata, FormStoreShape, FormStoreValidation, GetFormStoreApiStore, GetFromFormStoreShape, GetValidationValuesFromSchema, HandleSubmitCB, HandleValidation, InputDateTypes, ValidationEvents, ValidationMetadata, createFormStoreBuilder, errorFormatter, formatDate, getFirstDateOfWeek, getWeekNumber, handleCreateFormStore, inputDateHelpers, isZodError, isZodValidator, parseDate, useCreateFormStore };
