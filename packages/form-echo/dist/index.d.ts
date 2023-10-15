import { FormEvent } from 'react';
import { ZodSchema, z, ZodError } from 'zod';
import * as zustand from 'zustand';
import { StoreApi } from 'zustand';

/**
 * @template Name
 * @template Value
 * @typedef FieldMetadata
 *
 * @prop {Name & string} name
 * @prop {Value} initialValue
 */
/** @exports FieldMetadata */
/**
 * @template FieldsValues
 * @template {keyof FieldsValues} Key
 */
declare class FormStoreField<FieldsValues, Key extends keyof FieldsValues> {
    /**
     * @param {{
     *   id: string;
     *   value: FieldsValues[Key];
     *   metadata: FieldMetadata<Key, FieldsValues[Key]>;
     *   valueFromFieldToStore?: (fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>;
     *   valueFromStoreToField?: (StoreValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
     * }} params
     */
    constructor(params: {
        id: string;
        value: FieldsValues[Key];
        metadata: FieldMetadata$1<Key, FieldsValues[Key]>;
        valueFromFieldToStore?: ((fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>) | undefined;
        valueFromStoreToField?: ((StoreValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined) | undefined;
    });
    /** @type {string} */
    id: string;
    /** @type {FieldsValues[Key]} */
    value: FieldsValues[Key];
    /** @type {FieldMetadata<Key, FieldsValues[Key]>} */
    metadata: FieldMetadata$1<Key, FieldsValues[Key]>;
    /** @type {((fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>) | undefined} */
    valueFromFieldToStore: ((fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>) | undefined;
    /** @type {(storeValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined} */
    valueFromStoreToField: (storeValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
    /**
     * @description Gets the field value converted _(using the passed `valueFromStoreToField` if not it will just return the original value)_ from the store value.
     *
     * @type {string | ReadonlyArray<string> | number | undefined}
     * */
    get storeToFieldValue(): string | number | readonly string[] | undefined;
}
type FieldMetadata$1<Name, Value> = {
    name: Name & string;
    initialValue: Value;
};

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
type ValidationEvents = 'submit' | 'change' | 'blur';
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
type SubmitState = {
    counter: number;
    passedAttempts: number;
    failedAttempts: number;
    errorMessage: string | null;
    isActive: boolean;
};
type FocusActive<FieldsValues> = {
    isActive: true;
    field: {
        id: string;
        name: keyof FieldsValues;
    };
};
type FocusInActive = {
    isActive: false;
    field: null;
};
type FocusState<FieldsValues> = FocusActive<FieldsValues> | FocusInActive;
interface FormStoreShape<FieldsValues, ValidationsHandlers> {
    submit: SubmitState;
    currentDirtyFieldsCounter: number;
    isDirty: boolean;
    baseId: string;
    id: string;
    focus: FocusState<FieldsValues>;
    metadata: FormStoreMetadata<FieldsValues, ValidationsHandlers>;
    validations: {
        [Key in keyof GetValidationValuesFromSchema<ValidationsHandlers>]: FormStoreValidation<GetValidationValuesFromSchema<ValidationsHandlers>, Key>;
    };
    fields: {
        [Key in NonNullable<keyof FieldsValues>]: FormStoreField<FieldsValues, Key>;
    };
    utils: {
        getFieldValues(): FieldsValues;
        setSubmitState: (valueOrUpdater: Partial<SubmitState> | ((value: SubmitState) => Partial<SubmitState>)) => void;
        setFocusState: (fieldName: keyof FieldsValues, validationName: keyof ValidationsHandlers | (keyof FieldsValues & keyof ValidationsHandlers), isActive: boolean) => void;
        resetFormStore: (itemsToReset?: {
            fields?: boolean;
            validations?: boolean;
            submit?: boolean;
            focus?: boolean;
        }) => void;
        setFieldValue: <Name extends keyof FieldsValues>(name: Name, valueOrUpdater: ((value: FieldsValues[Name]) => FieldsValues[Name]) | AnyValueExceptFunctions) => void;
        handleOnInputChange: <Name extends keyof FieldsValues, ValidationName extends keyof ValidationsHandlers | undefined = undefined>(name: Name, valueOrUpdater: ((value: FieldsValues[Name]) => FieldsValues[Name]) | AnyValueExceptFunctions, validationName?: ValidationName) => void;
        handleSubmit: (cb: HandleSubmitCB<FieldsValues, ValidationsHandlers>) => (event: FormEvent<HTMLFormElement>) => Promise<unknown> | unknown;
        errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string;
        setFieldError: (params: {
            name: keyof ValidationsHandlers;
            message: string | null;
            validationEvent: ValidationEvents;
        }) => void;
        getFieldEventsListeners: (name: keyof FieldsValues, validationName?: keyof ValidationsHandlers) => {
            onChange: (event: {
                target: {
                    value: string;
                };
            }) => void;
            onFocus: () => void;
            onBlur: () => void;
        };
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
                message: string | null;
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
    initialValues: FieldsValues;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationsHandlers: {
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
 * @param {import("..").InputDateTypes} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
 * @returns {string} A formatted string based on the specified format.
 */
declare function formatDate(date: Date, type: InputDateTypes): string;
/**
 * Parses a string in the specified format and returns a Date object.
 * @param {string | number} dateString - The string to be parsed.
 * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
 * @returns {Date} - The parsed Date object.
 */
declare function parseDate(dateString: string | number, type: string): Date;
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
declare namespace inputDateHelpers {
    export { formatDate };
    export { parseDate };
    export { getWeekNumber };
    export { getFirstDateOfWeek };
}

declare function isZodValidator(validator: unknown): validator is ZodSchema;
declare function isZodError(error: unknown): error is ZodError;
declare function errorFormatter(error: unknown): string;

declare const handleCreateFormStore: <FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;
declare const useCreateFormStore: <FieldsValues, ValidationsHandlers>(props: Omit<CreateFormStoreProps<FieldsValues, ValidationsHandlers>, "baseId"> & {
    baseId?: string | boolean | undefined;
}) => zustand.StoreApi<FormStoreShape<FieldsValues, ValidationsHandlers>>;

/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
declare function onNotNullableTo<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnNullableDefaultReturn<Value, DefaultValue>;
/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
declare function onTruthyTo<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnTruthyDefaultReturn<Value, DefaultValue>;
declare namespace dateInput {
    function parse(type: InputDateTypes): (dateString: string | number | false | null | undefined) => Date | null;
    function format(type: InputDateTypes): (dateString: Date | FalsyValues) => string | null;
}
declare namespace onNullable {
    function toEmptyString<Value>(value: Value): OnNullableDefaultReturn<Value, "">;
    function toUndefined<Value>(value: Value): OnNullableDefaultReturn<Value, undefined>;
    function toNull<Value>(value: Value): OnNullableDefaultReturn<Value, null>;
    function to<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnNullableDefaultReturn<Value, DefaultValue>;
    namespace falsy {
        export function toEmptyString_1<Value>(value: Value): OnNullableDefaultReturn<Value, "">;
        export { toEmptyString_1 as toEmptyString };
        export function toUndefined_1<Value>(value: Value): OnNullableDefaultReturn<Value, undefined>;
        export { toUndefined_1 as toUndefined };
        export function toNull_1<Value>(value: Value): OnNullableDefaultReturn<Value, null>;
        export { toNull_1 as toNull };
        export { onNotNullableTo as to };
    }
}
declare namespace onFalsy {
    export function toEmptyString_2<Value>(value: Value): OnFalsyDefaultReturn<Value, "">;
    export { toEmptyString_2 as toEmptyString };
    export function toUndefined_2<Value>(value: Value): OnFalsyDefaultReturn<Value, undefined>;
    export { toUndefined_2 as toUndefined };
    export function toNull_2<Value>(value: Value): OnFalsyDefaultReturn<Value, null>;
    export { toNull_2 as toNull };
    export { onFalsyTo as to };
}
declare namespace onTruthy {
    export function toEmptyString_3<Value>(value: Value): OnTruthyDefaultReturn<Value, "">;
    export { toEmptyString_3 as toEmptyString };
    export function toUndefined_3<Value>(value: Value): OnTruthyDefaultReturn<Value, undefined>;
    export { toUndefined_3 as toUndefined };
    export function toNull_3<Value>(value: Value): OnTruthyDefaultReturn<Value, null>;
    export { toNull_3 as toNull };
    export { onTruthyTo as to };
}

type FalsyValues = undefined | null | false | 0 | '';
type OnFalsyDefaultReturn<Value, DefaultValue> = Value extends FalsyValues ? DefaultValue : NonNullable<Value>;
type OnTruthyDefaultReturn<Value, DefaultValue> = Value extends FalsyValues ? NonNullable<Value> : DefaultValue;
type OnNullableDefaultReturn<Value, DefaultValue> = Value extends null | undefined ? DefaultValue : Value;
type OnNotNullableDefaultReturn<Value, DefaultValue> = Value extends null | undefined ? Value : DefaultValue;
/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
declare function onFalsyTo<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnFalsyDefaultReturn<Value, DefaultValue>;
declare namespace formFieldValueHelpers {
    export { dateInput as onDateInput };
    export { onNullable };
    export { onFalsy };
    export { onTruthy };
}

type SetStateInternal<T> = (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void;
declare function createFormStoreBuilder<FieldsValues, ValidationsHandlers>(params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>): (set: SetStateInternal<FormStoreShape<FieldsValues, ValidationsHandlers>>, get: () => FormStoreShape<FieldsValues, ValidationsHandlers>) => FormStoreShape<FieldsValues, ValidationsHandlers>;

export { CreateFormStoreProps, FalsyValues, FieldMetadata, FormStoreApi, FormStoreMetadata, FormStoreShape, FormStoreValidation, GetFormStoreApiStore, GetFromFormStoreShape, GetValidationValuesFromSchema, HandleSubmitCB, HandleValidation, InputDateTypes, OnFalsyDefaultReturn, OnNotNullableDefaultReturn, OnNullableDefaultReturn, OnTruthyDefaultReturn, ValidationEvents, ValidationMetadata, createFormStoreBuilder, dateInput, errorFormatter, formatDate, formFieldValueHelpers as fvh, getFirstDateOfWeek, getWeekNumber, handleCreateFormStore, inputDateHelpers, isZodError, isZodValidator, onFalsy, onNotNullableTo, onNullable, onTruthy, onTruthyTo, parseDate, useCreateFormStore };
