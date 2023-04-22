import { FormEvent } from 'react';
import { ZodSchema } from 'zod';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';

type InputDateTypes = 'date' | 'time' | 'datetime-local' | 'week' | 'month';
type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';
type HandleValidation<Value> = (value: unknown, validationEvent: ValidationEvents) => Value;
interface FieldMetadata<Name, Value> {
    name: Name & string;
    id: string;
    initialValue: Value;
}
interface FieldValidation<Value> {
    handler?: HandleValidation<Value>;
    events: {
        [key in ValidationEvents]: {
            isActive: boolean;
            passedAttempts: number;
            failedAttempts: number;
        };
    };
    passedAttempts: number;
    failedAttempts: number;
}
type FieldIsDirtyErrorsAndValidation = {
    isDirty: false;
    errors: null;
} | {
    isDirty: true;
    errors: string[];
};
type FieldShape<Name, Value, ValidatedValue> = {
    validation: ValidatedValue extends undefined ? never : FieldValidation<ValidatedValue>;
    value: Exclude<Value, Function>;
    isDirty: boolean;
    errors: string[];
    isUpdatingValueOnError: boolean;
    metadata: FieldMetadata<Name, Value>;
    valueFromFieldToStore?: (fieldValue: unknown) => Value;
    valueFromStoreToField?: (StoreValue: Value) => string;
};
type AllFieldsShape<PassedAllFields, PassedValidatedFields> = {
    [FieldName in keyof PassedAllFields]: FieldShape<FieldName, PassedAllFields[FieldName], PassedValidatedFields extends {
        [Key in FieldName]: unknown;
    } ? PassedValidatedFields[FieldName] : never>;
};
interface FormMetadata<PassedAllFields> {
    formId: string;
    fieldsNames: (keyof PassedAllFields)[];
}
interface FormStoreShape<PassedAllFields, PassedValidatedFields> {
    fields: AllFieldsShape<PassedAllFields, PassedValidatedFields>;
    errors: {
        [Key in keyof PassedAllFields]?: string[] | null;
    };
    metadata: FormMetadata<PassedAllFields>;
    isTrackingValidationHistory: boolean;
    validations: {
        history: unknown[];
        handler: {
            [Key in keyof PassedAllFields]?: HandleValidation<PassedValidatedFields extends {
                [K in Key]: unknown;
            } ? PassedValidatedFields[Key] : PassedAllFields[Key]>;
        };
    };
    submitCounter: number;
    utils: {
        handleOnInputChange: (name: keyof PassedAllFields, value: unknown) => void;
        errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string[];
        reInitFieldsValues: () => void;
        setFieldValue: (name: keyof PassedAllFields, value: ((value: PassedAllFields[typeof name]) => PassedAllFields[typeof name]) | PassedAllFields[typeof name]) => void;
        setFieldErrors: (params: {
            name: keyof PassedAllFields;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        }) => void;
        createValidationHistoryRecord: (params: {
            validationEvent: ValidationEvents;
            validationEventPhase: 'start' | 'end';
            validationEventState: 'processing' | 'failed' | 'passed';
            fields: AllFieldsShape<PassedAllFields, PassedValidatedFields>[keyof PassedAllFields][];
        }) => unknown;
        handleFieldValidation: (params: {
            name: keyof PassedAllFields;
            value: unknown;
            validationEvent: ValidationEvents;
        }) => PassedAllFields[keyof PassedAllFields];
        handlePreSubmit: (cb?: HandlePreSubmitCB<PassedAllFields, PassedValidatedFields>) => (event: FormEvent<HTMLFormElement>) => void;
    };
}
type HandlePreSubmitCB<PassedAllFields, PassedValidatedFields> = (event: FormEvent<HTMLFormElement>, params: {
    validatedValues: PassedValidatedFields extends ValidationHandler<PassedAllFields> ? GetFieldsValueFromValidationHandler<PassedAllFields, PassedValidatedFields> : Record<string, never>;
    values: PassedAllFields;
    hasError: boolean;
    errors: {
        [Key in keyof PassedAllFields]: {
            name: Key;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        };
    };
}) => void;
type CreateCreateFormStore<PassedFields, PassedValidatedFields> = FormStoreShape<{
    [Key in keyof PassedFields]: PassedFields[Key];
}, PassedValidatedFields>;
type FormStoreApi<Fields, ValidatedFields> = StoreApi<CreateCreateFormStore<Fields, ValidatedFields>>;
type FormStoreValues<Fields> = {
    [Key in keyof Fields]: Fields extends AllFieldsShape<Record<string, unknown>, unknown> ? Fields[Key]['value'] : never;
};
type FormStoreErrors<Fields> = {
    [Key in keyof Fields]: Fields extends AllFieldsShape<Record<string, unknown>, unknown> ? Fields[Key]['errors'] : never;
};
type ValidationHandler<PassedFields> = {
    [Key in keyof PassedFields]?: HandleValidation<unknown> | ZodSchema<unknown>;
};
type GetFieldsValueFromValidationHandler<PassedFields, PassedValidationHandler extends ValidationHandler<PassedFields>> = {
    [Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown> ? ReturnType<PassedValidationHandler[Key]['parse']> : PassedValidationHandler[Key] extends HandleValidation<unknown> ? ReturnType<PassedValidationHandler[Key]> : never;
};
type CreateFormStoreProps<PassedFields, StorePassedValidationHandler extends ValidationHandler<PassedFields> | never> = {
    initValues: PassedFields extends Record<string, unknown> ? PassedFields : never;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    trackValidationHistory?: boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationHandler?: StorePassedValidationHandler extends ValidationHandler<PassedFields> ? StorePassedValidationHandler : never;
    valuesFromFieldsToStore?: {
        [Key in keyof PassedFields]?: (fieldValue: string) => PassedFields[Key];
    };
    valuesFromStoreToFields?: {
        [Key in keyof PassedFields]?: (storeValue: PassedFields[Key]) => string;
    };
    errorFormatter?: (error: unknown, validationEvent: ValidationEvents) => string[];
};

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

declare const createFormStore: <PassedFields, PassedValidationHandler extends ValidationHandler<PassedFields>>({ isUpdatingFieldsValueOnError, trackValidationHistory, valuesFromFieldsToStore, valuesFromStoreToFields, validationHandler: validationsHandler, ...params }: CreateFormStoreProps<PassedFields, PassedValidationHandler>) => zustand.StoreApi<CreateCreateFormStore<PassedFields, PassedValidationHandler>>;
declare const useFormStore: <fields extends Record<string, unknown>, PassedValidatedFields, U>(store: FormStoreApi<fields, PassedValidatedFields>, cb: (state: CreateCreateFormStore<fields, PassedValidatedFields>) => U) => U;

export { AllFieldsShape, CreateCreateFormStore, CreateFormStoreProps, FieldIsDirtyErrorsAndValidation, FieldMetadata, FieldShape, FieldValidation, FormMetadata, FormStoreApi, FormStoreErrors, FormStoreShape, FormStoreValues, GetFieldsValueFromValidationHandler, HandlePreSubmitCB, HandleValidation, InputDateTypes, ValidationEvents, ValidationHandler, createFormStore, inputDateHelpers, useFormStore };
