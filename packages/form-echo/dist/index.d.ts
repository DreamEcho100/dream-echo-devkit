import { FormEvent } from 'react';
import * as zod from 'zod';
import { ZodSchema, z } from 'zod';
export { f as fvh } from './field-value-43bb012e.js';

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

type TFunction = (...args: any[]) => any;
type AnyValueExceptFunctions = Exclude<{} | null | undefined, TFunction>;
type InputDateTypes = 'date' | 'time' | 'datetime-local' | 'week' | 'month';
type GetValidationValuesFromSchema<Schema> = {
    [Key in keyof Schema]: Schema[Key] extends ZodSchema<unknown> ? z.infer<Schema[Key]> : Schema[Key] extends TFunction ? ReturnType<Schema[Key]> : Schema[Key];
};
/****************        ****************/
/************** Validation **************/
/****************        ****************/
type ValidationEvents = 'submit' | 'change' | 'blur';
type ValidationError = {
    currentEvent: ValidationEvents | null;
    isDirty: false;
    error: null;
} | {
    currentEvent: ValidationEvents;
    isDirty: true;
    error: {
        message: string;
    };
};
type HandleValidation2Props<FieldsValues, ValidationSchema, Key extends keyof ValidationSchema> = FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> & {
    validationEvent: ValidationEvents;
    get: () => FormStoreShape<FieldsValues, ValidationSchema>;
    value: Key extends keyof FieldsValues ? FieldsValues[Key] : never;
    name: Key extends keyof FieldsValues ? Key & string : never;
};
interface HandleValidation2<FieldsValues, ValidationSchema, Key extends keyof ValidationSchema> {
    (params: HandleValidation2Props<FieldsValues, ValidationSchema, Key>): ValidationSchema[Key];
}
type ValidValidationSchemaItem<FieldsValues, Key> = (Key extends keyof FieldsValues ? HandleValidation2<FieldsValues, Record<string, unknown>, Key & string> : HandleValidation2<FieldsValues, Record<string, unknown>, string>) | ZodSchema;
type ValidValidationSchema<FieldsValues> = {
    [Key in keyof FieldsValues | (string & {})]?: ValidValidationSchemaItem<FieldsValues, Key>;
};
interface ValidationMetadata<Name> {
    name: Name & string;
}
type FormStoreValidation<FieldsValues, ValidationSchema, Key extends keyof ValidationSchema> = {
    handler: HandleValidation2<FieldsValues, ValidationSchema, Key>;
    events: {
        [key in ValidationEvents]: {
            isActive: boolean;
            passedAttempts: number;
            failedAttempts: number;
        };
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
interface FormStoreMetadata<FieldsValues, ValidationSchema> {
    fieldsNames: (keyof FieldsValues)[];
    fieldsNamesMap: Record<keyof FieldsValues, true>;
    validatedFieldsNamesMap: Record<keyof ValidationSchema, true>;
    validatedFieldsNames: (keyof ValidationSchema)[];
    manualValidatedFields: Exclude<keyof ValidationSchema, keyof FieldsValues>[];
    manualValidatedFieldsMap: Record<Exclude<keyof ValidationSchema, keyof FieldsValues>, true>;
    referencedValidatedFields: (keyof ValidationSchema & keyof FieldsValues)[];
    referencedValidatedFieldsMap: Record<keyof ValidationSchema & keyof FieldsValues, true>;
}
interface SubmitState {
    counter: number;
    passedAttempts: number;
    failedAttempts: number;
    errorMessage: string | null;
    isActive: boolean;
}
interface FocusActive<FieldsValues> {
    isActive: true;
    field: {
        id: string;
        name: keyof FieldsValues;
    };
}
interface FocusInActive {
    isActive: false;
    field: null;
}
type FocusState<FieldsValues> = FocusActive<FieldsValues> | FocusInActive;
interface FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> {
    getValues(): FieldsValues;
    getValue<Key extends keyof FieldsValues>(name: Key): FieldsValues[typeof name];
    setSubmitState: (valueOrUpdater: Partial<SubmitState> | ((value: SubmitState) => Partial<SubmitState>)) => void;
    setFocusState: (fieldName: keyof FieldsValues, validationName: keyof ValidationSchema | (keyof FieldsValues & keyof ValidationSchema), isActive: boolean) => void;
    resetFormStore: (itemsToReset?: {
        fields?: boolean;
        validations?: boolean;
        submit?: boolean;
        focus?: boolean;
    }) => void;
    setFieldValue: <Name extends keyof FieldsValues>(name: Name, valueOrUpdater: ((value: FieldsValues[Name]) => FieldsValues[Name]) | AnyValueExceptFunctions) => void;
    handleInputChange: <Name extends keyof FieldsValues, ValidationName extends keyof ValidationSchema | undefined = undefined>(name: Name, valueOrUpdater: ((value: FieldsValues[Name]) => FieldsValues[Name]) | AnyValueExceptFunctions, validationName?: ValidationName) => void;
    handleSubmit: (cb: HandleSubmitCB<FieldsValues, ValidationSchema>) => (event: FormEvent<HTMLFormElement>) => Promise<unknown> | unknown;
    errorFormatter: (error: unknown, validationEvent: ValidationEvents) => string;
    setFieldError: (params: {
        name: keyof ValidationSchema;
        message: string | null;
        validationEvent: ValidationEvents;
    }) => void;
    getFieldEventsListeners: (name: keyof FieldsValues, validationName?: keyof ValidationSchema) => {
        onChange: (event: {
            target: {
                value: string;
            };
        }) => void;
        onFocus: () => void;
        onBlur: () => void;
    };
}
interface FormStoreShape<FieldsValues, ValidationSchema> extends FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> {
    submit: SubmitState;
    currentDirtyFieldsCounter: number;
    isDirty: boolean;
    baseId: string;
    id: string;
    focus: FocusState<FieldsValues>;
    metadata: FormStoreMetadata<FieldsValues, ValidationSchema>;
    validations: {
        [Key in keyof GetValidationValuesFromSchema<ValidationSchema>]: FormStoreValidation<FieldsValues, ValidationSchema, Key>;
    };
    fields: {
        [Key in NonNullable<keyof FieldsValues>]: FormStoreField<FieldsValues, Key>;
    };
    _baseMethods: FormStoreShapeBaseMethods<FieldsValues, ValidationSchema>;
}
interface HandleSubmitCB<FieldsValues, ValidationSchema> {
    (params: {
        event: FormEvent<HTMLFormElement>;
        validatedValues: GetValidationValuesFromSchema<ValidationSchema>;
        values: FieldsValues;
        hasError: boolean;
        errors: {
            [Key in keyof ValidationSchema]: {
                name: Key;
                message: string | null;
                validationEvent: ValidationEvents;
            };
        };
    }): unknown | Promise<unknown>;
}
type GetFromFormStoreShape<TFormStore, TValueType extends 'values' | 'validationSchemas' | 'validatedValues' = 'values'> = TFormStore extends FormStoreShape<infer FieldsValues, infer ValidationSchema> ? TValueType extends 'validationSchemas' ? ValidationSchema : TValueType extends 'validatedValues' ? GetValidationValuesFromSchema<ValidationSchema> : FieldsValues : never;
/****************        ****************/
/************ CreateFormStore ************/
/****************        ****************/
interface CreateFormStoreProps<FieldsValues, ValidationSchema extends ValidValidationSchema<FieldsValues>> {
    initialValues: FieldsValues;
    isUpdatingFieldsValueOnError?: boolean;
    baseId?: string | boolean;
    validationEvents?: {
        [key in ValidationEvents]?: boolean;
    };
    validationSchema?: ValidationSchema extends ValidValidationSchema<FieldsValues> ? ValidationSchema : undefined;
    valuesFromFieldsToStore?: {
        [Key in keyof FieldsValues]?: (fieldValue: string) => FieldsValues[Key];
    };
    valuesFromStoreToFields?: {
        [Key in keyof FieldsValues]?: (storeValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
    };
    errorFormatter?: (error: unknown, validationEvent: ValidationEvents) => string;
}

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

export { CreateFormStoreProps, FieldMetadata, FormStoreMetadata, FormStoreShape, FormStoreShapeBaseMethods, FormStoreValidation, GetFromFormStoreShape, GetValidationValuesFromSchema, HandleSubmitCB, HandleValidation2, HandleValidation2Props, InputDateTypes, ValidValidationSchema, ValidValidationSchemaItem, ValidationEvents, ValidationMetadata, createFormStoreBuilder, errorFormatter, isZodError, isZodValidator };
