import { FormEvent } from 'react';
import { ZodSchema } from 'zod';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';

type TPassedFieldsShape = Record<string, unknown>;
type InputDateTypes = 'date' | 'time' | 'datetime-local' | 'week' | 'month';
type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';
type HandleValidation<Value> = (value: unknown, validationEvent: ValidationEvents) => Value;
interface FieldMetadata<Name, Value> {
    name: Name & string;
    id: string;
    initialValue: Value;
}
interface FieldValidation<Value> {
    handler: HandleValidation<Value>;
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
    validation: FieldValidation<ValidatedValue>;
    value: Exclude<Value, Function>;
    isDirty: boolean;
    errors: string[];
    isUpdatingValueOnError: boolean;
    metadata: FieldMetadata<Name, Value>;
    valueFromFieldToStore?: (fieldValue: unknown) => Value;
    valueFromStoreToField?: (StoreValue: Value) => string;
};
type AllFieldsShape<PassedFields = TPassedFieldsShape, PassedValidatedFields = undefined> = {
    [FieldName in NonNullable<keyof PassedFields>]: FieldShape<FieldName, PassedFields[FieldName], PassedValidatedFields extends Record<FieldName, unknown> ? PassedValidatedFields[FieldName] : never>;
};
interface FormMetadata<PassedFields = TPassedFieldsShape> {
    formId: string;
    fieldsNames: (keyof PassedFields)[];
}
interface FormStoreShape<PassedFields = TPassedFieldsShape, PassedValidatedFields = Record<keyof PassedFields, unknown>> {
    fields: AllFieldsShape<PassedFields, PassedValidatedFields>;
    errors: {
        [Key in keyof PassedFields]?: string[] | null;
    };
    metadata: FormMetadata<PassedFields>;
    isTrackingValidationHistory: boolean;
    validations: {
        history: unknown[];
    };
    submitCounter: number;
    utils: {
        handleOnInputChange: (name: keyof PassedFields, value: unknown) => void;
        errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string[];
        reInitFieldsValues: () => void;
        setFieldValue: <Name extends keyof PassedFields>(name: Name, value: ((value: PassedFields[Name]) => PassedFields[Name]) | Exclude<PassedFields[Name], (...args: any[]) => any>) => void;
        setFieldErrors: (params: {
            name: keyof PassedFields;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        }) => void;
        createValidationHistoryRecord: (params: {
            validationEvent: ValidationEvents;
            validationEventPhase: 'start' | 'end';
            validationEventState: 'processing' | 'failed' | 'passed';
            fields: AllFieldsShape<PassedFields, PassedValidatedFields>[keyof PassedFields][];
        }) => unknown;
        handleFieldValidation: <Name extends keyof PassedFields>(params: {
            name: Name;
            value: unknown | ((value: PassedFields[Name]) => PassedFields[Name]);
            validationEvent: ValidationEvents;
        }) => Exclude<PassedFields[keyof PassedFields], (...args: any[]) => any>;
        handlePreSubmit: (cb?: THandlePreSubmitCB<PassedFields, PassedValidatedFields>) => (event: FormEvent<HTMLFormElement>) => void;
    };
}
type GetPassedValidationFieldsValues<PV> = {
    [Key in keyof PV]: PV[Key] extends ZodSchema<unknown> ? ReturnType<PV[Key]['parse']> : PV[Key] extends HandleValidation<unknown> ? ReturnType<PV[Key]> : undefined;
};
type HandlePreSubmitCB<Fields, ValidatedField> = THandlePreSubmitCB<Fields, GetPassedValidationFieldsValues<ValidatedField>>;
type THandlePreSubmitCB<PassedFields = TPassedFieldsShape, PassedValidatedFields = Record<keyof PassedFields, unknown>> = (event: FormEvent<HTMLFormElement>, params: {
    validatedValues: PassedValidatedFields;
    values: PassedFields;
    hasError: boolean;
    errors: {
        [Key in keyof PassedFields]: {
            name: Key;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        };
    };
}) => void;
type CreateCreateFormStore<PassedFields = TPassedFieldsShape, PassedValidatedFields = Record<keyof PassedFields, unknown>> = FormStoreShape<{
    [Key in keyof PassedFields]: PassedFields[Key];
}, PassedValidatedFields extends NonNullable<PassedValidatedFields> ? GetPassedValidationFieldsValues<PassedValidatedFields> : never>;
type FormStoreApi<Fields = TPassedFieldsShape, ValidatedFields = Record<keyof Fields, unknown>> = StoreApi<CreateCreateFormStore<Fields, ValidatedFields>>;
type FormStoreValues<Fields = AllFieldsShape<TPassedFieldsShape, Record<string, unknown>>> = {
    [Key in keyof Fields]: Fields extends AllFieldsShape<TPassedFieldsShape, Record<string, unknown>> ? Fields[Key]['value'] : never;
};
type FormStoreErrors<Fields = AllFieldsShape<TPassedFieldsShape, Record<string, unknown>>> = {
    [Key in keyof Fields]: Fields extends AllFieldsShape<TPassedFieldsShape, Record<string, unknown>> ? Fields[Key]['errors'] : never;
};
type ValidationHandler<PassedFields = TPassedFieldsShape> = {
    [Key in keyof PassedFields]?: HandleValidation<PassedFields[Key]>;
};
type CreateStoreValidationHandler<PassedFields = TPassedFieldsShape, PassedValidationHandler = unknown> = {
    [Key in keyof PassedFields & keyof PassedValidationHandler]?: PassedValidationHandler[Key];
};
type GetFieldsValueFromValidationHandler<PassedFields = TPassedFieldsShape, PassedValidationHandler = CreateStoreValidationHandler<PassedFields>> = {
    [Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown> ? ReturnType<PassedValidationHandler[Key]['parse']> : PassedValidationHandler[Key] extends HandleValidation<unknown> ? ReturnType<PassedValidationHandler[Key]> : never;
};
type CreateFormStoreProps<PassedFields = TPassedFieldsShape, StorePassedValidationHandler = Record<keyof PassedFields, unknown>> = {
    initValues: PassedFields;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    trackValidationHistory?: boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationHandler: {
        [Key in keyof StorePassedValidationHandler]: StorePassedValidationHandler[Key] extends ZodSchema<unknown> | HandleValidation<unknown> ? StorePassedValidationHandler[Key] : never;
    };
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

declare const handleCreateFormStore: <PassedFields = Record<string, unknown>, PassedValidationHandler = Record<keyof PassedFields, unknown>>({ isUpdatingFieldsValueOnError, trackValidationHistory, valuesFromFieldsToStore, valuesFromStoreToFields, validationHandler, ...params }: CreateFormStoreProps<PassedFields, PassedValidationHandler>) => zustand.StoreApi<CreateCreateFormStore<PassedFields, PassedValidationHandler>>;
declare const useCreateFormStore: <PassedFields = Record<string, unknown>, PassedValidationHandler = Record<keyof PassedFields, unknown>>(props: CreateFormStoreProps<PassedFields, PassedValidationHandler>) => zustand.StoreApi<CreateCreateFormStore<PassedFields, PassedValidationHandler>>;

export { AllFieldsShape, CreateCreateFormStore, CreateFormStoreProps, CreateStoreValidationHandler, FieldIsDirtyErrorsAndValidation, FieldMetadata, FieldShape, FieldValidation, FormMetadata, FormStoreApi, FormStoreErrors, FormStoreShape, FormStoreValues, GetFieldsValueFromValidationHandler, GetPassedValidationFieldsValues, HandlePreSubmitCB, HandleValidation, InputDateTypes, THandlePreSubmitCB, ValidationEvents, ValidationHandler, handleCreateFormStore, inputDateHelpers, useCreateFormStore };
