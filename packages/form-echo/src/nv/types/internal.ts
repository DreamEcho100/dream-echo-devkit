// import type { FormError, ValidationEvents } from ".";

// export type ErrorFormatter = (
//   error: unknown,
//   validationEvent: ValidationEvents,
// ) => FormError;

// export interface FormErrorShape<Key> {
//   name: Key;
//   error: FormError | null;
//   validationEvent: ValidationEvents;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TFunction = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/ban-types
export type OtherStrings = string & {};
export type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
  Exclude<{}, TFunction> | null | undefined;

export type SetStateInternal<Type> = (
  partial: Type | Partial<Type> | ((state: Type) => Type | Partial<Type>),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...params: any[]
) => void;
