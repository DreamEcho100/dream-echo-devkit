import type { FormEvent } from "react";
import type { StoreApi } from "zustand";

import type {
  FormStoreShape,
  GetValidationValuesFromSchema,
  HandleSubmitCB,
} from "../../../types";

export type FormStoreApi<
  ControlsValues,
  ValidationSchema = Record<keyof ControlsValues, unknown>,
> = StoreApi<FormStoreShape<ControlsValues, ValidationSchema>>;

export type GetFormStoreApiStore<
  TFormStore,
  TValueType extends
    | "values"
    | "validationSchemas"
    | "validatedValues" = "values",
> = TFormStore extends FormStoreApi<
  infer ControlsValues,
  infer ValidationSchema
>
  ? TValueType extends "validationSchemas"
    ? ValidationSchema
    : TValueType extends "validatedValues"
      ? GetValidationValuesFromSchema<ValidationSchema>
      : ControlsValues
  : never;

export type PropsWithFormStore<
  ControlsValues,
  ValidationSchema,
  Props = unknown,
> = Props & {
  store: FormStoreApi<ControlsValues, ValidationSchema>;
};

export type PropsWithFormStoreForm<
  ControlsValues,
  ValidationSchema,
  Props = unknown,
> = PropsWithFormStore<
  ControlsValues,
  ValidationSchema,
  Omit<Props, "onSubmit"> & {
    onSubmit: HandleSubmitCB<
      ControlsValues,
      ValidationSchema,
      FormEvent<HTMLFormElement>
    >;
  }
>;

export type PropsWithFormStoreControl<
  ControlsValues,
  ValidationSchema,
  Props = unknown,
> = PropsWithFormStore<
  ControlsValues,
  ValidationSchema,
  Props & {
    name: keyof ControlsValues;
    validationName?: keyof ValidationSchema;
  }
>;

export type PropsWithFormStoreValidationItem<
  ControlsValues,
  ValidationSchema,
  Props,
> = PropsWithFormStore<
  ControlsValues,
  ValidationSchema,
  (
    | {
        controlName: Exclude<keyof ControlsValues, keyof ValidationSchema>;
        validationName: Exclude<keyof ValidationSchema, keyof ControlsValues>;
      }
    | {
        controlName?: never;
        validationName: keyof ValidationSchema & keyof ControlsValues;
      }
  ) &
    Props
>;
