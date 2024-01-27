import { useId, useRef } from "react";
import { createStore, useStore } from "zustand";

import createFormStoreBuilder from "~/utils/create-form-store-builder";

export { useStore } from "zustand";
export * from "./types";

/**
 * @template ControlsValues
 * @typedef {import("../../../types").ValidValidationSchema<ControlsValues>} ValidValidationSchema
 */

/**
 * @template ControlsValues
 * @template {ValidValidationSchema<ControlsValues>} ValidationSchema
 * @typedef {import("../../../types").CreateFormStoreProps<ControlsValues, ValidationSchema>} CreateFormStoreProps
 */

/**
 * @template ControlsValues
 * @template {ValidValidationSchema<ControlsValues>} ValidationSchema
 * @param {CreateFormStoreProps<ControlsValues, ValidationSchema>} params
 */
export const handleCreateFormStore = (params) =>
  createStore(createFormStoreBuilder(params));

/**
 * @template ControlsValues
 * @template {ValidValidationSchema<ControlsValues>} ValidationSchema
 * @param {CreateFormStoreProps<ControlsValues, ValidationSchema>} props
 */
export const useCreateFormStore = (props) => {
  const baseId = useId();
  const formStoreRef = useRef(
    handleCreateFormStore({ ...props, baseId: props.baseId ?? baseId }),
  );

  return formStoreRef.current;
};

/**
 * @template ControlsValues, ValidationSchema
 * @param {import("./types").PropsWithFormStoreControl<ControlsValues, ValidationSchema, { ignoreFocus?: boolean }>} props
 */
export function useGetControlProps(props) {
  const value = useStore(
    props.store,
    (store) => store.controls[props.name].storeToControlValue,
  );
  const metadata = useStore(
    props.store,
    (store) => store.controls[props.name].metadata,
  );
  const id = useStore(props.store, (store) => store.controls[props.name].id);
  const getControlEventsListeners = useStore(
    props.store,
    (store) => store.getControlEventsListeners,
  );

  const isFocused = useStore(props.store, (store) => {
    if (props.ignoreFocus) return false;

    return store.focus.control?.name === props.name;
  });

  return {
    base: { value, id, name: metadata.name },
    getControlEventsListeners,
    metadata,
    isFocused,
  };
}

/**
 * @template ControlsValues, ValidationSchema
 * @param {import("./types").PropsWithFormStoreValidationItem<ControlsValues, ValidationSchema, { ignoreFocus?: boolean }>} props
 */
export function useGetControlErrorProps(props) {
  const error = useStore(props.store, (store) => {
    if (!props.validationName && !props.controlName) return;

    return store.validations.items[props.validationName ?? props.controlName]
      .error;
  });
  const controlId = useStore(
    props.store,
    (store) => store.controls[props.controlName ?? props.validationName].id,
  );

  const isFocused = useStore(props.store, (store) => {
    if (props.ignoreFocus) return false;

    return store.focus.control?.name === props.controlName;
  });

  return { error, isFocused, controlId };
}
