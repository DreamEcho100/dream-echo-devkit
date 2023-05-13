import { FormEvent } from 'react';
import { ZodSchema } from 'zod';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';

type TPassedFieldsShape = Record<string, unknown>;
type InputDateTypes = 'date' | 'time' | 'datetime-local' | 'week' | 'month';
type ValidationEvents = 'submit' | 'change';
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
    value: Exclude<Value, (value: Value) => Value>;
    isDirty: boolean;
    errors: string[];
    isUpdatingValueOnError: boolean;
    metadata: FieldMetadata<Name, Value>;
    valueFromFieldToStore?: (fieldValue: unknown) => Exclude<Value, (value: Value) => Value>;
    valueFromStoreToField?: (StoreValue: Value) => string;
};
type AllFieldsShape<Fields, // = TPassedFieldsShape,
ValidatedFields> = {
    [FieldName in NonNullable<keyof Fields>]: FieldShape<FieldName, Fields[FieldName], ValidatedFields extends Record<FieldName, unknown> ? ValidatedFields[FieldName] : never>;
};
interface FormMetadata<Fields> {
    formId: string;
    fieldsNames: (keyof Fields)[];
}
interface FormStoreShape<Fields, // = TPassedFieldsShape,
ValidatedFields> {
    fields: AllFieldsShape<Fields, ValidatedFields>;
    errors: {
        [Key in keyof Fields]?: string[] | null;
    };
    metadata: FormMetadata<Fields>;
    isTrackingValidationHistory: boolean;
    validations: {
        history: unknown[];
    };
    submitCounter: number;
    utils: {
        handleOnInputChange: (name: keyof Fields, value: unknown) => void;
        errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string[];
        reInitFieldsValues: () => void;
        setFieldValue: <Name extends keyof Fields>(name: Name, value: ((value: Fields[Name]) => Fields[Name]) | Exclude<Fields[Name], (...args: any[]) => any>) => void;
        setFieldErrors: (params: {
            name: keyof Fields;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        }) => void;
        createValidationHistoryRecord: (params: {
            validationEvent: ValidationEvents;
            validationEventPhase: 'start' | 'end';
            validationEventState: 'processing' | 'failed' | 'passed';
            fields: AllFieldsShape<Fields, ValidatedFields>[keyof Fields][];
        }) => unknown;
        handleFieldValidation: <Name extends keyof Fields, ValueToCheck>(params: {
            name: Name;
            value: ValueToCheck extends (value: Fields[Name]) => Fields[Name] ? (value: Fields[Name]) => Fields[Name] : ValueToCheck;
            validationEvent: ValidationEvents;
        }) => Exclude<Fields[Name], (value: Fields[Name]) => Fields[Name]>;
        handlePreSubmit: (cb?: THandlePreSubmitCB<Fields, ValidatedFields>) => (event: FormEvent<HTMLFormElement>) => void;
    };
}
type GetPassedValidationFieldsValues<PV> = {
    [Key in keyof PV]: PV[Key] extends ZodSchema<unknown> ? ReturnType<PV[Key]['parse']> : PV[Key] extends HandleValidation<unknown> ? ReturnType<PV[Key]> : undefined;
};
type HandlePreSubmitCB<Fields, ValidatedField> = THandlePreSubmitCB<Fields, GetPassedValidationFieldsValues<ValidatedField>>;
type THandlePreSubmitCB<Fields, // = TPassedFieldsShape,
ValidatedFields = Record<keyof Fields, unknown>> = (event: FormEvent<HTMLFormElement>, params: {
    validatedValues: ValidatedFields;
    values: Fields;
    hasError: boolean;
    errors: {
        [Key in keyof Fields]: {
            name: Key;
            errors: string[] | null;
            validationEvent: ValidationEvents;
        };
    };
}) => void;
type CreateCreateFormStore<Fields, // = TPassedFieldsShape,
ValidatedFields = Record<keyof Fields, unknown>> = FormStoreShape<{
    [Key in keyof Fields]: Fields[Key];
}, ValidatedFields extends NonNullable<ValidatedFields> ? GetPassedValidationFieldsValues<ValidatedFields> : never>;
type FormStoreApi<Fields, // = TPassedFieldsShape,
ValidatedFields = Record<keyof Fields, unknown>> = StoreApi<CreateCreateFormStore<Fields, ValidatedFields>>;
type FormStoreValues<Fields = AllFieldsShape<TPassedFieldsShape, Record<string, unknown>>> = {
    [Key in keyof Fields]: Fields extends AllFieldsShape<TPassedFieldsShape, Record<string, unknown>> ? Fields[Key]['value'] : never;
};
type FormStoreErrors<Fields = AllFieldsShape<TPassedFieldsShape, Record<string, unknown>>> = {
    [Key in keyof Fields]: Fields extends AllFieldsShape<TPassedFieldsShape, Record<string, unknown>> ? Fields[Key]['errors'] : never;
};
type ValidationHandler<Fields = TPassedFieldsShape> = {
    [Key in keyof Fields]?: HandleValidation<Fields[Key]>;
};
type CreateStoreValidationHandler<Fields = TPassedFieldsShape, PassedValidationHandler = unknown> = {
    [Key in keyof Fields & keyof PassedValidationHandler]?: PassedValidationHandler[Key];
};
type GetFieldsValueFromValidationHandler<Fields, // = TPassedFieldsShape,
PassedValidationHandler = CreateStoreValidationHandler<Fields>> = {
    [Key in keyof PassedValidationHandler]: PassedValidationHandler[Key] extends ZodSchema<unknown> ? ReturnType<PassedValidationHandler[Key]['parse']> : PassedValidationHandler[Key] extends HandleValidation<unknown> ? ReturnType<PassedValidationHandler[Key]> : never;
};
type CreateFormStoreProps<Fields, // = TPassedFieldsShape,
StorePassedValidationHandler = Record<keyof Fields, unknown>> = {
    initValues: Fields;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    trackValidationHistory?: boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationSchema: {
        [Key in keyof StorePassedValidationHandler]: StorePassedValidationHandler[Key] extends ZodSchema<unknown> | HandleValidation<unknown> ? StorePassedValidationHandler[Key] : never;
    };
    valuesFromFieldsToStore?: {
        [Key in keyof Fields]?: (fieldValue: string) => Fields[Key];
    };
    valuesFromStoreToFields?: {
        [Key in keyof Fields]?: (storeValue: Fields[Key]) => string;
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

declare const handleCreateFormStore: <Fields, ValidationSchema>({ isUpdatingFieldsValueOnError, trackValidationHistory, valuesFromFieldsToStore, valuesFromStoreToFields, validationSchema, ...params }: CreateFormStoreProps<Fields, ValidationSchema>) => zustand.StoreApi<CreateCreateFormStore<Fields, ValidationSchema>>;
declare const useCreateFormStore: <Fields, ValidationSchema>(props: Omit<CreateFormStoreProps<Fields, ValidationSchema>, "baseId"> & {
    baseId?: string | boolean | undefined;
}) => zustand.StoreApi<CreateCreateFormStore<Fields, ValidationSchema>>;

export { AllFieldsShape, CreateCreateFormStore, CreateFormStoreProps, CreateStoreValidationHandler, FieldIsDirtyErrorsAndValidation, FieldMetadata, FieldShape, FieldValidation, FormMetadata, FormStoreApi, FormStoreErrors, FormStoreShape, FormStoreValues, GetFieldsValueFromValidationHandler, GetPassedValidationFieldsValues, HandlePreSubmitCB, HandleValidation, InputDateTypes, THandlePreSubmitCB, ValidationEvents, ValidationHandler, handleCreateFormStore, inputDateHelpers, useCreateFormStore };
