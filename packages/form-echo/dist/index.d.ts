import { FormEvent } from 'react';
import { ZodSchema } from 'zod';
import { StoreApi } from 'zustand';

type InputDateTypes = 'date' | 'time' | 'datetime-local' | 'week' | 'month';
type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';
type HandleValidation<Value> = (value: unknown, validationEvent: ValidationEvents) => Value;
type PassedAllFieldsShape = Record<string, unknown>;
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
type FieldShape<Name, Value> = {
    validation: FieldValidation<Value>;
    value: Value;
    isDirty: boolean;
    errors: string[];
    isUpdatingValueOnError: boolean;
    metadata: FieldMetadata<Name, Value>;
    valueFromFieldToStore?(fieldValue: string | number): Value;
    valueFromStoreToField?(StoreValue: Value): string | number;
};
type AllFieldsShape<PassedAllFields extends PassedAllFieldsShape> = {
    [FieldName in keyof PassedAllFields]: FieldShape<FieldName, PassedAllFields[FieldName]>;
};
interface FormMetadata<PassedAllFields extends PassedAllFieldsShape> {
    formId: string;
    fieldsNames: (keyof PassedAllFields)[];
}
interface FormStoreShape<PassedAllFields extends PassedAllFieldsShape> {
    fields: AllFieldsShape<PassedAllFields>;
    errors: {
        [Key in keyof PassedAllFields]?: string[] | null;
    };
    metadata: FormMetadata<PassedAllFields>;
    isTrackingValidationHistory: boolean;
    validations: {
        history: unknown[];
        handler: {
            [Key in keyof PassedAllFields]?: HandleValidation<PassedAllFields[Key]>;
        };
    };
    submitCounter: number;
    utils: {
        handleOnInputChange: (name: keyof PassedAllFields, value: any) => void;
        errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string[];
        reInitFieldsValues(): void;
        setFieldValue(name: keyof PassedAllFields, value: ((value: unknown) => PassedAllFields[typeof name]) | unknown): void;
        setFieldErrors(params: {
            name: keyof PassedAllFields;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        }): void;
        createValidationHistoryRecord(params: {
            validationEvent: ValidationEvents;
            validationEventPhase: 'start' | 'end';
            validationEventState: 'processing' | 'failed' | 'passed';
            fields: AllFieldsShape<PassedAllFields>[keyof PassedAllFields][];
        }): unknown;
        handleFieldValidation<Name extends keyof PassedAllFields>(params: {
            name: Name;
            value: any;
            validationEvent: ValidationEvents;
        }): PassedAllFields[Name];
        handlePreSubmit: (cb?: HandlePreSubmitCB<PassedAllFields>) => (event: FormEvent<HTMLFormElement>) => void;
    };
}
type HandlePreSubmitCB<PassedAllFields extends Record<string, unknown>> = (event: FormEvent<HTMLFormElement>, params: {
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
type CreateCreateFormStore<PassedFields> = FormStoreShape<{
    [Key in keyof PassedFields]: PassedFields[Key];
}>;
type FormStoreApi<Fields> = StoreApi<CreateCreateFormStore<Fields>>;
type FormStoreValues<TFields extends AllFieldsShape<PassedAllFieldsShape>> = {
    [Key in keyof TFields]: TFields[Key]['value'];
};
type FormStoreErrors<TFields extends AllFieldsShape<PassedAllFieldsShape>> = {
    [Key in keyof TFields]: TFields[Key]['errors'];
};
type CreateFormStoreProps<PassedFields extends Record<string, unknown>> = {
    initValues: PassedFields;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    trackValidationHistory?: boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationHandler?: {
        [Key in keyof PassedFields]?: HandleValidation<PassedFields[Key]> | ZodSchema;
    };
    valuesFromFieldsToStore?: {
        [Key in keyof PassedFields]?: (fieldValue: string | number) => PassedFields[Key];
    };
    valuesFromStoreToFields?: {
        [Key in keyof PassedFields]?: (storeValue: PassedFields[Key]) => string | number;
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

declare const createFormStore: <PassedFields extends Record<string, unknown>>({ isUpdatingFieldsValueOnError, trackValidationHistory, valuesFromFieldsToStore, valuesFromStoreToFields, validationHandler: validationsHandler, ...params }: CreateFormStoreProps<PassedFields>) => FormStoreApi<PassedFields>;
declare const useFormStore: <TAllFields extends PassedAllFieldsShape, U>(store: FormStoreApi<TAllFields>, cb: (state: CreateCreateFormStore<TAllFields>) => U) => U;

export { AllFieldsShape, CreateCreateFormStore, CreateFormStoreProps, FieldIsDirtyErrorsAndValidation, FieldMetadata, FieldShape, FieldValidation, FormMetadata, FormStoreApi, FormStoreErrors, FormStoreShape, FormStoreValues, HandlePreSubmitCB, HandleValidation, InputDateTypes, PassedAllFieldsShape, ValidationEvents, createFormStore, inputDateHelpers, useFormStore };
