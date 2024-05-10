import { errorFormatter as defaultErrorFormatter } from "~/utils/zod.js";
import FormStoreControl from "./control.js";

/**
 * @template ControlsValues
 * @typedef {import("~/types/index.js").ValidValidationSchemaInput<ControlsValues>} ValidValidationSchemaInput
 */

/**
 * @template ControlsValues
 * @template {ValidValidationSchemaInput<ControlsValues>} ValidationSchema
 * @typedef {import("~/types/index.js").CreateFormStoreProps<ControlsValues, ValidationSchema>} CreateFormStoreProps
 */
/**
 * @template ControlsValues, ValidationSchema
 * @typedef {import("~/types/index.js").FormStoreShape<ControlsValues, ValidationSchema>} FormStoreShape
 */
/**
 * @typedef {import("~/types/index.js").ValidationEvents} ValidationEvents
 */

/**
 * @template ControlsValues
 * @template {ValidValidationSchemaInput<ControlsValues>} ValidationSchema
 * @param {CreateFormStoreProps<ControlsValues, ValidationSchema>} params - Parameters for creating form store controls.
 * @param {string} baseId - Base identifier for the form store controls.
 * @param {import('./metadata.js').FormStoreMetadata<ControlsValues, ValidationSchema>} metadata - Metadata object for the form store.
 *
 * @description Creates controls for the form store based on the provided parameters and metadata.
 */
export function createFormStoreControls(params, baseId, metadata) {
  /**
   * @typedef {FormStoreShape<ControlsValues, ValidationSchema>} FormStore
   * @typedef {FormStore['controls']} Controls
   * @typedef {FormStore['controls'][keyof Controls]} Control
   **/

  const control = /** @type {Controls} */ ({});

  for (const controlName of metadata.controlsNames) {
    control[controlName] = new FormStoreControl(
      /** @type {Control} */
      ({
        value: params.initialValues[controlName],
        valueFromControlToStore: params.valuesFromControlsToStore?.[controlName]
          ? params.valuesFromControlsToStore[controlName]
          : undefined,
        valueFromStoreToControl: params.valuesFromStoreToControls?.[controlName]
          ? params.valuesFromStoreToControls[controlName]
          : undefined,
        id: `control-${String(controlName)}-${baseId}`,
        metadata: {
          name: controlName,
          initialValue: params.initialValues[controlName],
        },
      }),
    );
  }

  return control;
}

const itemsToResetDefaults = {
  controls: true,
  validations: true,
  submit: false,
  focus: true,
};

/**
 * @template ControlsValues
 * @template ValidationSchema
 * @param {import('~/types/internal.js').FormErrorShape<keyof ValidationSchema>} params
 * @returns {(currentStat: import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>) => import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>}
 */
function _setValidationError(params) {
  return function (currentState) {
    if (
      !currentState.validations.items[params.name].events[
        params.validationEvent
      ].isActive
    )
      return currentState;

    let currentDirtyControlsCounter =
      currentState.validations.currentDirtyControlsCounter;
    const validationItem = {
      ...currentState.validations.items[params.name],
    };
    validationItem.currentEvent = params.validationEvent;

    if (params.error) {
      validationItem.failedAttempts++;
      validationItem.events[params.validationEvent].failedAttempts++;

      if (!currentState.validations.dirtyControls[params.name]) {
        validationItem.currentDirtyEventsCounter++;
        if (validationItem.currentDirtyEventsCounter > 0) {
          currentDirtyControlsCounter++;
        }
      }

      currentState.validations.dirtyControls[params.name] = true;
      validationItem.error = params.error;
    } else {
      validationItem.passedAttempts++;
      validationItem.events[params.validationEvent].passedAttempts++;

      if (currentState.validations.dirtyControls[params.name]) {
        validationItem.currentDirtyEventsCounter--;
        if (validationItem.currentDirtyEventsCounter === 0) {
          currentDirtyControlsCounter--;
        }
      }

      currentState.validations.dirtyControls[params.name] = false;
      validationItem.error = null;
    }

    currentState.validations.lastActive.item = params.name;
    currentState.validations.lastActive.event = params.validationEvent;
    currentState.validations.currentDirtyControlsCounter =
      currentDirtyControlsCounter;
    currentState.validations.isDirty = currentDirtyControlsCounter > 0;

    currentState.validations.items = {
      ...currentState.validations.items,
      [params.name]: validationItem,
    };

    return currentState;
  };
}

/**
 * @template ControlsValues
 * @template ValidationSchema
 * @template {keyof ControlsValues} Name
 * @param {Name} name
 * @param {import('~/types/internal.js').AnyValueExceptFunctions | ((value: ControlsValues[Name]) => ControlsValues[Name])} valueOrUpdater
 * @returns {(currentStat: import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>) => import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>}
 */
function _setControlValue(name, valueOrUpdater) {
  return function (currentState) {
    const control = currentState.controls[name];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    control.value =
      typeof valueOrUpdater === "function"
        ? valueOrUpdater(control.value)
        : valueOrUpdater;

    return {
      ...currentState,
      controls: {
        ...currentState.controls,
        [name]: control,
      },
    };
  };
}

/**
 * @template ControlsValues
 * @template {import('~/types/index.js').ValidValidationSchemaInput<ControlsValues>} ValidationSchema
 * @param {import('~/types/internal.js').SetStateInternal<import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>>} set
 * @param {() => import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>} get
 * @param {import('~/types/index.js').CreateFormStoreProps<ControlsValues, ValidationSchema>} params
 */
export function getFormStoreBaseMethods(set, get, params) {
  /**
   * @typedef {import('~/types/index.js').FormStoreShapeBaseMethods<ControlsValues, ValidationSchema>} FormStoreBaseMethods
   * @typedef {FormStoreBaseMethods['getControlsValues']} GetValues
   * @typedef {FormStoreBaseMethods['getControlValue']} GetValue
   * @typedef {keyof ControlsValues} ControlsValuesKeys
   * @typedef {FormStoreBaseMethods['setSubmit']} SetSubmitState
   * @typedef {FormStoreBaseMethods['setControlFocus']} SetFocusState
   * @typedef {FormStoreBaseMethods['resetFormStore']} ResetFormStore
   * @typedef {FormStoreBaseMethods['setControlValue']} SetControlValue
   * @typedef {FormStoreBaseMethods['setValidationError']} SetControlError
   * @typedef {FormStoreBaseMethods['errorFormatter']} ErrorFormatter
   * @typedef {FormStoreBaseMethods['getControlEventsListeners']} GetControlEventsListeners
   * @typedef {FormStoreBaseMethods['handleControlChange']} HandleInputChange
   * @typedef {FormStoreBaseMethods['handleSubmit']} HandleSubmit
   */

  /** @type {GetValues} */
  function getControlsValues() {
    const currentState = get();
    const controlsValues = /** @type {ControlsValues} */ ({});

    /** @type {string} */
    let controlName;
    for (controlName in currentState.controls) {
      controlsValues[/** @type {ControlsValuesKeys} */ (controlName)] =
        currentState.controls[
          /** @type {ControlsValuesKeys} */ (controlName)
        ].value;
    }

    return controlsValues;
  }

  /** @type {GetValue} */
  function getControlValue(name) {
    const currentState = get();
    return currentState.controls[name].value;
  }

  /** @type {SetSubmitState} */
  function setSubmit(valueOrUpdater) {
    const currentState = get();

    const submit = {
      ...currentState.submit,
      ...(typeof valueOrUpdater === "function"
        ? valueOrUpdater(currentState.submit)
        : valueOrUpdater),
    };
    set({ submit });
  }

  /** @type {SetFocusState} */
  function setControlFocus(controlName, validationName, type) {
    let currentState = get();

    if (currentState.validations.items[validationName].events.focus.isActive) {
      try {
        currentState.validations.items[validationName].handler({
          value: /** @type {never} */ (
            !validationName || controlName === validationName
              ? currentState.controls[controlName].value
              : undefined
          ),
          name: /** @type {never} */ (controlName),
          validationEvent: "focus",
          get,
          getControlValue: currentState.getControlValue,
          getControlsValues: currentState.getControlsValues,
          setValidationError: currentState.setValidationError,
          setSubmit: currentState.setSubmit,
          setControlFocus: currentState.setControlFocus,
          resetFormStore: currentState.resetFormStore,
          setControlValue: currentState.setControlValue,
          errorFormatter: currentState.errorFormatter,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentState = _setValidationError({
          name: validationName,
          error: null,
          validationEvent: "focus",
        })(currentState);
      } catch (error) {
        const formattedError = currentState.errorFormatter(error, "focus");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentState = _setValidationError({
          name: validationName,
          error: formattedError,
          validationEvent: "focus",
        })(currentState);
      }

      if (
        currentState.focus.isPending &&
        currentState.focus.control.name === controlName
      )
        return set(currentState);
    }

    /** @type {typeof currentState['focus']} */
    const focus =
      type === "in"
        ? {
            isPending: true,
            control: {
              name: controlName,
              id: currentState.controls[controlName].id,
            },
          }
        : { isPending: false, control: null };

    set({ focus });
  }

  /** @type {ResetFormStore} */
  function resetFormStore(itemsToReset = itemsToResetDefaults) {
    const currentState = get();
    const controls = currentState.controls;
    const validations = currentState.validations;
    let submit = currentState.submit;
    let focus = currentState.focus;

    if (itemsToReset.controls) {
      /** @type {keyof typeof controls} */
      let controlName;
      for (controlName in controls) {
        controls[controlName].value =
          controls[controlName].metadata.initialValue;
      }
    }

    if (itemsToReset.validations) {
      validations.currentDirtyControlsCounter = 0;
      validations.dirtyControls = {};
      validations.isDirty = false;
      validations.lastActive.event = null;
      validations.lastActive.item = null;

      for (const key in validations.items) {
        validations.items[key].failedAttempts = 0;
        validations.items[key].passedAttempts = 0;
        validations.items[key].currentEvent = null;
        validations.items[key].error = null;

        /** @type {import('~/types/index.js').ValidationEvents} */
        let eventKey;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (eventKey in validations.items[key].events) {
          validations.items[key].events[eventKey].isActive = false;
          validations.items[key].events[eventKey].failedAttempts = 0;
          validations.items[key].events[eventKey].passedAttempts = 0;
        }
      }
    }
    if (itemsToReset.submit) {
      submit = {
        counter: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        error: null,
        isPending: false,
      };
    }

    if (itemsToReset.focus) {
      focus = {
        isPending: false,
        control: null,
      };
    }

    return set({ controls, validations, submit, focus });
  }

  /** @type {SetControlValue} */
  function setControlValue(name, value) {
    return set(_setControlValue(name, value));
  }

  /** @type {SetControlError} */
  function setValidationError(params) {
    set(_setValidationError(params));
  }

  /** @type {ErrorFormatter} */
  const errorFormatter = params.errorFormatter ?? defaultErrorFormatter;

  /** @type {HandleInputChange} */
  function handleControlChange(name, valueOrUpdater, validationName) {
    let currentState = get();
    const control = currentState.controls[name];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = /** @type {ControlsValues[typeof name]} */ (
      typeof valueOrUpdater === "function"
        ? valueOrUpdater(control.value)
        : control.valueFromControlToStore?.(valueOrUpdater) ?? valueOrUpdater
    );

    const _validationName = validationName
      ? validationName
      : currentState.metadata.referencedValidatedControlsMap[name]
        ? name
        : undefined;

    if (
      _validationName &&
      currentState.validations.items[_validationName].events.change.isActive
    ) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentState = _setControlValue(
          name,
          currentState.validations.items[_validationName].handler({
            value: /** @type {never} */ (
              validationName &&
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              validationName !== name
                ? currentState.getControlsValues()
                : value
            ),
            name: /** @type {never} */ (name),
            get,
            validationEvent: "change",
            getControlValue: currentState.getControlValue,
            getControlsValues: currentState.getControlsValues,
            setValidationError: currentState.setValidationError,
            setSubmit: currentState.setSubmit,
            setControlFocus: currentState.setControlFocus,
            resetFormStore: currentState.resetFormStore,
            setControlValue: currentState.setControlValue,
            errorFormatter: currentState.errorFormatter,
          }),
        )(currentState);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentState = _setValidationError({
          name: /** @type {keyof ValidationSchema} */ (_validationName),
          error: null,
          validationEvent: "change",
        })(currentState);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentState = _setValidationError({
          name: /** @type {keyof ValidationSchema} */ (_validationName),
          error: currentState.errorFormatter(error, "change"),
          validationEvent: "change",
        })(currentState);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentState = _setControlValue(name, value)(currentState);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      currentState = _setControlValue(name, value)(currentState);
    }

    set(currentState);
  }

  /** @type {GetControlEventsListeners} */
  function getControlEventsListeners(name, validationName) {
    const currentState = get();
    const _validationName = validationName ?? name;

    return {
      /** @param {{ target: { value: string } }} event */
      onChange: (event) => {
        currentState.handleControlChange(name, event.target.value);
      },
      onFocus: () => {
        currentState.setControlFocus(name, _validationName, "in");
      },
      onBlur: () => {
        currentState.setControlFocus(name, _validationName, "out");
      },
    };
  }

  /** @type {HandleSubmit} */
  function handleSubmit(cb) {
    return async function (event) {
      /** @type {{ preventDefault?: () => void }} */ (event).preventDefault?.();

      get().setSubmit({ isPending: true, error: null });
      const currentState = get();
      currentState.focus = { isPending: false, control: null };
      // currentState.submit = {
      // 	...currentState.submit,
      // 	isPending: true,
      // 	error: null,
      // };

      const metadata = currentState.metadata;
      const controls = currentState.controls;
      const validations = currentState.validations.items;
      /** @type {Record<string, unknown> } */
      const values = {};
      /** @type {Record<string, unknown> } */
      const validatedValues = {};

      /** @type {Record<string, import('~/types/internal.js').FormErrorShape<keyof ValidationSchema>> } */
      const errors = {};

      let hasError = false;

      /** @type {keyof typeof controls & string} */
      let controlName;
      for (controlName in controls) {
        values[controlName] = controls[controlName].value;

        try {
          const validationSchema =
            controlName in metadata.referencedValidatedControlsMap &&
            validations[controlName].handler;

          if (
            typeof validationSchema !== "function" ||
            !validations[controlName].events.submit.isActive
          ) {
            continue;
          }

          validatedValues[controlName] = validationSchema({
            value: /** @type {never} */ (controls[controlName].value),
            name: controlName,
            validationEvent: "submit",
            get,
            errorFormatter: currentState.errorFormatter,
            getControlsValues: currentState.getControlsValues,
            getControlValue: currentState.getControlValue,
            resetFormStore: currentState.resetFormStore,
            setControlFocus: currentState.setControlFocus,
            setControlValue: currentState.setControlValue,
            setSubmit: currentState.setSubmit,
            setValidationError: currentState.setValidationError,
          });

          errors[controlName] = {
            name: controlName,
            error: null,
            validationEvent: "submit",
          };
        } catch (error) {
          errors[controlName] = {
            name: controlName,
            error: currentState.errorFormatter(error, "submit"),
            validationEvent: "submit",
          };
        }
      }

      /** @type {keyof (typeof metadata)['manualValidatedControlsMap'] } */
      let manualControlName;
      for (manualControlName of metadata.customValidatedControls) {
        try {
          const validationSchema =
            currentState.validations.items[manualControlName].handler;
          if (typeof validationSchema !== "function") {
            continue;
          }

          validatedValues[/** @type {string} */ (manualControlName)] =
            validationSchema({
              value: /** @type {never} */ (undefined),
              name: /** @type {never} */ (undefined),
              validationEvent: "submit",
              get,
              errorFormatter: currentState.errorFormatter,
              getControlsValues: currentState.getControlsValues,
              getControlValue: currentState.getControlValue,
              resetFormStore: currentState.resetFormStore,
              setControlFocus: currentState.setControlFocus,
              setControlValue: currentState.setControlValue,
              setSubmit: currentState.setSubmit,
              setValidationError: currentState.setValidationError,
            });

          errors[/** @type {string} */ (manualControlName)] = {
            name: /** @type {keyof ValidationSchema} */ (manualControlName),
            error: null,
            validationEvent: "submit",
          };
        } catch (error) {
          errors[/** @type {string} */ (manualControlName)] = {
            name: /** @type {keyof ValidationSchema} */ (manualControlName),
            error: currentState.errorFormatter(error, "submit"),
            validationEvent: "submit",
          };
        }
      }

      /**
       * @description Necessary Evil
       * @typedef {ControlsValues} Values
       * @typedef {import('~/types/index.js').GetValidationValuesFromSchema<ValidationSchema>} ValidatedValues
       * @typedef {{ [Key in keyof ValidationSchema]: import('~/types/internal.js').FormErrorShape<Key> }} Error
       * @typedef {{ [Key in keyof ValidationSchema]: { name: Key; message: string | null; validationEvent: import('~/types/index.js').ValidationEvents; }; }} Errors
       */

      /** @type {keyof typeof errors & string} */
      let errorKey;
      for (errorKey in errors) {
        const errorObj =
          /** @type {import("~/types/internal.js").FormErrorShape<keyof ValidationSchema>} */ (
            errors[errorKey]
          );

        currentState.setValidationError(errorObj); // (currentState);

        if (!errorObj.error) continue;

        hasError = true;
      }

      if (hasError) {
        return currentState.setSubmit((prev) => ({
          isPending: false,
          counter: prev.counter + 1,
          failedAttempts: prev.counter + 1,
          error: currentState.errorFormatter(
            new Error("FORM_VALIDATION_ERROR"),
            "submit",
          ),
        }));
      }

      try {
        await cb({
          event,
          values:
            /** @type {Values} */
            (values),
          validatedValues:
            /** @type {ValidatedValues} */
            (validatedValues),
          get,
          getControlValue: currentState.getControlValue,
          getControlsValues: currentState.getControlsValues,
          setValidationError: currentState.setValidationError,
          setSubmit: currentState.setSubmit,
          setControlFocus: currentState.setControlFocus,
          resetFormStore: currentState.resetFormStore,
          setControlValue: currentState.setControlValue,
          errorFormatter: currentState.errorFormatter,
        });
        currentState.setSubmit((prev) => ({
          isPending: false,
          counter: prev.counter + 1,
          passedAttempts: prev.counter + 1,
          error: null,
        }));
      } catch (error) {
        currentState.setSubmit((prev) => ({
          isPending: false,
          counter: prev.counter + 1,
          failedAttempts: prev.counter + 1,
          error: currentState.errorFormatter(error, "submit"),
        }));
      }
    };
  }

  return {
    getControlsValues,
    getControlValue,
    errorFormatter,
    setSubmit,
    setControlFocus,
    resetFormStore,
    setControlValue,
    setValidationError,
    handleControlChange,
    getControlEventsListeners,
    handleSubmit,
  };
}
