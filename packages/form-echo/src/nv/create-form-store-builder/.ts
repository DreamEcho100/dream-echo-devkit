/*
State Management for Forms
Validation
Integration with TypeScript
Handling Nested Forms
Third-Party Libraries
Custom Form Handling
*/

/*
 * - `fields`: it will be an object that will handle managing the fields.
 * - `resolvers`: it will handle the validation, errors, and rules for the field.
 * - `submit`: it will handle submit state and how to handle how to submit.
 * - `metadata`:  it will have other data needed for managing the form like id, etc.
 * and some other properties and methods to effectively handle managing the form
 */

import type { infer as ZodInfer, ZodSchema } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TFunction = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/ban-types
export type OtherStrings = string & {};

// Resolvers types start here
interface ResolverRules {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  multiple?: boolean;
  step?: number;
}
type InferInputResolverSchema<InputResolvers> = {
  [Key in keyof InputResolvers]?: InputResolvers[Key] extends ZodSchema
    ? ZodInfer<InputResolvers[Key]>
    : InputResolvers[Key] extends (params: any) => infer R
      ? R
      : never;
};

interface FormStoreResolverParams<Values, InputResolvers, ResolverError, Key> {
  get: () => FormStoreShape<Values, InputResolvers, ResolverError>;
  value: Key extends keyof Values ? Values[Key] : never;
}
type ResolverHandler<Values, InputResolvers, ResolverError, Key> = (
  params: FormStoreResolverParams<Values, InputResolvers, ResolverError, Key>,
) => Key extends keyof InputResolvers
  ? InputResolvers[Key] extends ZodSchema
    ? ZodInfer<InputResolvers[Key]>
    : InputResolvers[Key] extends (params: any) => infer R
      ? R
      : never
  : never;
type ValidInputResolverSchema<Values, ResolverError> = {
  [Key in keyof Values | OtherStrings]?:
    | ZodSchema
    | ((
        params: FormStoreResolverParams<
          Values,
          Record<string, unknown>,
          ResolverError,
          Key
        >,
      ) => unknown);
};

type FormStoreResolversSchema<Values, InputResolvers, Error> = {
  [Key in keyof InputResolvers]: ResolverHandler<
    Values,
    InputResolvers,
    Error,
    Key
  >;
};
interface FormStoreResolvers<Values, InputResolvers, ResolverError> {
  schema: FormStoreResolversSchema<Values, InputResolvers, ResolverError>;
  isValidating: boolean;

  rules: { [Key in keyof InputResolvers]: ResolverRules };

  errors: { [Key in keyof InputResolvers]: ResolverError };
  errorsCount: number;
  // errorsNames: keyof InputResolvers[]; // using a doubly link list here and saving it's pointer on a map could be better here

  isDirty: boolean;

  setError: (name: keyof InputResolvers, error: ResolverError) => void;
  setErrors: (errors: {
    [Key in keyof InputResolvers]?: ResolverError;
  }) => void;
  reset: (options?: { keepErrors?: boolean; keepIsDirty?: boolean }) => void;
}
// Resolvers types end here

interface CurrentField<Name> {
  name: Name;
  at: number;
}

interface FormStoreFields<Values> {
  values: Values;
  initialValues: Values;
  focused: null | CurrentField<keyof Values>;
  changing: null | CurrentField<keyof Values>;
  touched: {
    fields: { [Key in keyof Values]: false };
    count: number;
    last: null | CurrentField<keyof Values>;
  };
}

interface FormStoreMetadata {
  id: string;
}

type FormStoreSubmitStatus = "idle" | "pending" | "success" | "error";
interface FormStoreSubmitHandlerCbParams {
  get: () => FormStoreShape<unknown, unknown, unknown>;
  values: unknown;
  resolvers: unknown;
}
type FormStoreSubmitHandlerOptionsOnParams<Status = "success" | "error"> = {
  status: Status;
} & FormStoreSubmitHandlerCbParams;

interface FormStoreSubmit<Values, InputResolvers, ResolverError> {
  status: FormStoreSubmitStatus;
  count: {
    pending: number;
    success: number;
    error: number;
    reset: number;
  };

  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  setStatus: (
    status: FormStoreSubmitStatus,
    value: boolean,
    // options?: { reset?: boolean },
  ) => void;

  error: null | Error;
  isDirty: boolean;
  setError: (error: Error | null) => void;

  handler: <Event, U>(
    cb: (
      params: { event: Event } & FormStoreSubmitHandlerCbParams,
      options?: {
        onSuccess?: (
          result: U,
          params: FormStoreSubmitHandlerOptionsOnParams<"success">,
        ) => void | Promise<void>;
        onError?: (
          error: Error,
          params: FormStoreSubmitHandlerOptionsOnParams<"error">,
        ) => void | Promise<void>;
        onFinally?: (
          params:
            | FormStoreSubmitHandlerOptionsOnParams<"success">
            | FormStoreSubmitHandlerOptionsOnParams<"error">,
        ) => void | Promise<void>;
      },
    ) => U | Promise<U>,
  ) => U;

  reset: (options?: {
    keepErrors?: boolean;
    keepIsDirty?: boolean;
    keepStatus?: boolean;
    resetCount?:
      | boolean
      | Partial<Record<FormStoreSubmitStatus, boolean>>
      | FormStoreSubmitStatus
      | FormStoreSubmitStatus[];
  }) => void;
}

interface FormStoreShape<Values, InputResolvers, ResolverError> {
  fields: FormStoreFields<Values>;
  resolvers: FormStoreResolvers<Values, InputResolvers, ResolverError>;
  submit: FormStoreSubmit<Values, InputResolvers, ResolverError>;
  metadata: FormStoreMetadata;
}
