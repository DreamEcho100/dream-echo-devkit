import { FormEvent } from 'react';
import { ZodSchema, z } from 'zod';

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
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
declare function onNotNullableTo<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnNullableDefaultReturn<Value, DefaultValue>;
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
/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
declare function onFalsyTo<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnFalsyDefaultReturn<Value, DefaultValue>;
/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
declare function onTruthyTo<DefaultValue>(defaultValue: DefaultValue): <Value>(value: Value) => OnTruthyDefaultReturn<Value, DefaultValue>;
declare namespace formFieldValueHelpers {
    export { dateInput as onDateInput };
    export { onNullable };
    export { onFalsy };
    export { onTruthy };
}

export { CreateFormStoreProps as C, FormStoreShape as F, GetValidationValuesFromSchema as G, HandleValidation2Props as H, InputDateTypes as I, ValidValidationSchema as V, ValidationEvents as a, HandleValidation2 as b, ValidValidationSchemaItem as c, ValidationMetadata as d, FormStoreValidation as e, FieldMetadata as f, FormStoreMetadata as g, FormStoreShapeBaseMethods as h, HandleSubmitCB as i, GetFromFormStoreShape as j, formFieldValueHelpers as k, onNullable as l, onTruthy as m, onFalsy as o };
