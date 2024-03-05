import type { z, ZodSchema } from "zod";

import type {
  FormStoreResolvers,
  ResolveEvents,
  ValidExternalResolverSchema,
} from "../create-form-store-builder/resolvers";
import type { AnyValueExceptFunctions, TFunction } from "./internal";

export type ErrorFormatter = (
  error: unknown,
  validationEvent: ResolveEvents,
) => FormError;

export interface FormErrorShape<Key> {
  name: Key;
  error: FormError | null;
  validationEvent: ResolveEvents;
}

export type SharedStoreMethodsKeys =
  | "getValue"
  | "getValues"
  | "setError"
  | "setSubmit"
  | "setFocus"
  | "resetFormStore"
  | "setValue"
  | "errorFormatter";

export type HandleValidationPropsPassedMethods<
  ControlsValues,
  ValidationSchema,
> = {
  [Key in SharedStoreMethodsKeys]: FormStoreShapeBaseMethods<
    ControlsValues,
    ValidationSchema
  >[Key];
};

export type HandleSubmitCB<ControlsValues, ValidationSchema, Event> = (
  params: {
    event: Event;
    validatedValues: GetValidationValuesFromSchema<ValidationSchema>;
    values: ControlsValues;
    get: () => FormStoreShape<ControlsValues, ValidationSchema>;
  } & HandleValidationPropsPassedMethods<ControlsValues, ValidationSchema>,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
) => Promise<unknown> | unknown;

export interface SubmitState {
  counter: number;
  passedAttempts: number;
  failedAttempts: number;
  error: FormError | null;
  isPending: boolean;
}

export type FormError =
  | {
      message: string;
    }
  | { message: string; path: (string | number)[] }[];

export interface FormStoreShapeBaseMethods<Values, ExternalResolvers> {
  getValues: () => Values;
  getValue: <Key extends keyof Values>(name: Key) => Values[typeof name];
  setSubmit: (
    valueOrUpdater:
      | Partial<SubmitState>
      | ((value: SubmitState) => Partial<SubmitState>),
  ) => void;

  setFocus: (
    controlName: keyof Values,
    validationName:
      | keyof ExternalResolvers
      | (typeof controlName & keyof ExternalResolvers),
    type: "in" | "out",
  ) => void;

  resetFormStore: (itemsToReset?: {
    controls?: boolean;
    validations?: boolean;
    submit?: boolean;
    focus?: boolean;
  }) => void;
  setValue: <Name extends keyof Values>(
    name: Name,
    valueOrUpdater:
      | ((value: Values[Name]) => Values[Name])
      | AnyValueExceptFunctions,
  ) => void;
  handleChange: <
    Name extends keyof Values,
    ValidationName extends keyof ExternalResolvers | undefined = undefined,
  >(
    name: Name,
    valueOrUpdater:
      | ((value: Values[Name]) => Values[Name])
      | AnyValueExceptFunctions,
    validationName?: ValidationName,
  ) => void;
  handleSubmit: <Event>(
    cb: HandleSubmitCB<Values, ExternalResolvers, Event>,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ) => (event: Event) => Promise<unknown> | unknown;

  errorFormatter: ErrorFormatter;
  setError: (params: FormErrorShape<keyof ExternalResolvers>) => void;
  getEventsListeners: (
    name: keyof Values,
    validationName?: keyof ExternalResolvers,
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

export interface FormStoreShape<Values, ExternalResolvers, ErrorShape> {
  values: Values;
  initialValues: Values;
  baseId: string;
  resolvers: FormStoreResolvers<Values, ExternalResolvers, ErrorShape>;

  // metadataAndConfig: {
  //   // Some other useful data below here
  //   // ...
  // };
  // ExternalResolvers extends ValidExternalResolverSchema<Values>
  //   ? FormStoreResolvers<Values, ExternalResolvers>
  //   : Record<string, unknown>;
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
