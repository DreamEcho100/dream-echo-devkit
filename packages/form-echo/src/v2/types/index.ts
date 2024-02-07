import type { z, ZodSchema } from "zod";

import type { FormStoreValidations } from "../create-form-store-builder/validations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any;

export type ValidationEvents = "submit" | "change" | "focus"; // | 'mount' | 'custom'

export interface FormStoreShapeBaseMethods<Values, ValidationSchema> {
  getControlsValues: () => Values;
  getControlValue: <Key extends keyof Values>(name: Key) => Values[typeof name];
  setSubmit: (
    valueOrUpdater:
      | Partial<SubmitState>
      | ((value: SubmitState) => Partial<SubmitState>),
  ) => void;

  setControlFocus: (
    controlName: keyof Values,
    validationName:
      | keyof ValidationSchema
      | (typeof controlName & keyof ValidationSchema),
    type: "in" | "out",
  ) => void;

  resetFormStore: (itemsToReset?: {
    controls?: boolean;
    validations?: boolean;
    submit?: boolean;
    focus?: boolean;
  }) => void;
  setControlValue: <Name extends keyof Values>(
    name: Name,
    valueOrUpdater:
      | ((value: Values[Name]) => Values[Name])
      | AnyValueExceptFunctions,
  ) => void;
  handleControlChange: <
    Name extends keyof Values,
    ValidationName extends keyof ValidationSchema | undefined = undefined,
  >(
    name: Name,
    valueOrUpdater:
      | ((value: Values[Name]) => Values[Name])
      | AnyValueExceptFunctions,
    validationName?: ValidationName,
  ) => void;
  handleSubmit: <Event>(
    cb: HandleSubmitCB<Values, ValidationSchema, Event>,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ) => (event: Event) => Promise<unknown> | unknown;

  errorFormatter: ErrorFormatter;
  setValidationError: (params: FormErrorShape<keyof ValidationSchema>) => void;
  getControlEventsListeners: (
    name: keyof Values,
    validationName?: keyof ValidationSchema,
  ) => {
    onChange: (event: { target: { value: string } }) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export type GetValidationValuesFromSchema<Schema> = {
  [Key in keyof Schema]: Schema[Key] extends ZodSchema<unknown>
    ? z.infer<Schema[Key]>
    : Schema[Key] extends TFunction
      ? ReturnType<Schema[Key]>
      : Schema[Key];
};

export interface FormStoreShape<Values, ValidationSchema> {
  values: Values;
  initialValues: Values;
  errors: { [Key in keyof Values]?: string[] };
  config: {
    baseId: string;
    // Some other useful data below here
    // ...
  };
  validation: FormStoreValidations<Values, ValidationSchema>;
  // : {
  //   [Key in keyof Values]?: {
  //     handler: (value: Values[Key]) => string[] | Promise<string[]>;
  //     events?: string[]; // Events associated with this field (e.g., ['onChange', 'onBlur'])
  //     attempts: {
  //       failed: number;
  //       successful: number;
  //     };
  //     // Additional configuration properties specific to the field validator
  //     // ...
  //   };
  // };
  // Some other useful methods to set the store below here
  // ...
}
