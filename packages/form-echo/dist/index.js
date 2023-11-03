"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createFormStoreBuilder: () => createFormStoreBuilder,
  errorFormatter: () => errorFormatter,
  fvh: () => fieldValue_default,
  handleCreateFormStore: () => handleCreateFormStore,
  isZodError: () => isZodError,
  isZodValidator: () => isZodValidator,
  useCreateFormStore: () => useCreateFormStore
});
module.exports = __toCommonJS(src_exports);

// src/utils/FormStoreField.js
var FormStoreField = class {
  /** @type {string} */
  id;
  /** @type {FieldsValues[Key]} */
  value;
  /** @type {FieldMetadata<Key, FieldsValues[Key]>} */
  metadata;
  /** @type {((fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>) | undefined} */
  valueFromFieldToStore;
  /** @type {(storeValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined} */
  valueFromStoreToField;
  /**
   * @param {{
   *   id: string;
   *   value: FieldsValues[Key];
   *   metadata: FieldMetadata<Key, FieldsValues[Key]>;
   *   valueFromFieldToStore?: (fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>;
   *   valueFromStoreToField?: (StoreValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
   * }} params
   */
  constructor(params) {
    this.id = params.id;
    this.value = params.value;
    this.metadata = params.metadata;
    this.valueFromFieldToStore = params.valueFromFieldToStore;
    this.valueFromStoreToField = params.valueFromStoreToField ?? /**
     * @param {FieldsValues[Key]} StoreValue
     * @returns string | ReadonlyArray<string> | number | undefined
     */
    ((value) => value ?? "");
  }
  /**
   * @description Gets the field value converted _(using the passed `valueFromStoreToField` if not it will just return the original value)_ from the store value.
   *
   * @type {string | ReadonlyArray<string> | number | undefined}
   * */
  get storeToFieldValue() {
    return this.valueFromStoreToField(this.value);
  }
};

// src/utils/zod.ts
function isZodValidator(validator) {
  return !!(validator instanceof Object && "parseAsync" in validator && typeof validator.parseAsync === "function");
}
function isZodError(error) {
  return error instanceof Object && "errors" in error;
}
function errorFormatter(error) {
  if (isZodError(error))
    return error.format()._errors.join(", ");
  if (error instanceof Error)
    return error.message;
  return "Something went wrong!";
}

// src/utils/zustand.ts
var import_zustand = require("zustand");
var import_react = require("react");
var handleCreateFormStore = (params) => (0, import_zustand.createStore)(createFormStoreBuilder(params));
var useCreateFormStore = (props) => {
  const baseId = (0, import_react.useId)();
  const formStore = (0, import_react.useState)(
    handleCreateFormStore({ ...props, baseId: props.baseId || baseId })
  );
  return formStore[0];
};

// src/utils/helpers/inputDate.js
function formatDate(date, type) {
  let formattedDate = "";
  switch (type) {
    case "date":
      formattedDate = date.toISOString().slice(0, 10);
      break;
    case "time":
      formattedDate = date.toTimeString().slice(0, 8);
      break;
    case "datetime-local":
      formattedDate = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(
        2,
        "0"
      )}T${`${date.getHours()}`.padStart(
        2,
        "0"
      )}:${`${date.getMinutes()}`.padStart(2, "0")}`;
      break;
    case "week":
      const year = date.getFullYear();
      const weekNumber = getWeekNumber(date);
      formattedDate = `${year}-W${weekNumber.toString().length < 2 ? "0" + weekNumber.toString() : weekNumber.toString()}`;
      break;
    case "month":
      formattedDate = date.toISOString().slice(0, 7);
      break;
    default:
      break;
  }
  return formattedDate;
}
function parseDate(dateString, type) {
  let parsedDate;
  switch (type) {
    case "date":
      parsedDate = new Date(dateString);
      break;
    case "time":
      const [hours, minutes, seconds] = dateString.toString().split(":");
      parsedDate = /* @__PURE__ */ new Date();
      parsedDate.setHours(Number(hours || 0));
      parsedDate.setMinutes(Number(minutes || 0));
      parsedDate.setSeconds(Number(seconds || 0));
      break;
    case "datetime-local":
      parsedDate = new Date(dateString.toString().replace(" ", "T"));
      break;
    case "week":
      const [yearString, weekString] = dateString.toString().split("-W");
      const year = Number(yearString);
      const week = Number(weekString);
      parsedDate = getFirstDateOfWeek(year, week);
      break;
    case "month":
      parsedDate = /* @__PURE__ */ new Date(`${dateString}-01`);
      break;
    default:
      parsedDate = /* @__PURE__ */ new Date();
      break;
  }
  return parsedDate;
}
function getWeekNumber(date) {
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const daysSinceYearStart = (date.valueOf() - yearStart.valueOf()) / (1e3 * 60 * 60 * 24);
  const weekNumber = Math.floor(daysSinceYearStart / 7) + 1;
  return weekNumber;
}
function getFirstDateOfWeek(year, week) {
  const januaryFirst = new Date(year, 0, 1);
  const daysToFirstMonday = (8 - januaryFirst.getDay()) % 7;
  const firstMonday = new Date(januaryFirst);
  firstMonday.setDate(januaryFirst.getDate() + daysToFirstMonday);
  const daysToTargetMonday = (week - 1) * 7;
  const targetMonday = new Date(firstMonday);
  targetMonday.setDate(firstMonday.getDate() + daysToTargetMonday);
  return targetMonday;
}
var inputDateHelpers = {
  /**
   * Formats a date object to the desired string format based on the type.
   * @param {Date} date - The Date object to be formatted.
   * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
   * @returns {string} A formatted string based on the specified format.
   */
  formatDate,
  /**
   * Parses a string in the specified format and returns a Date object.
   * @param {string} dateString - The string to be parsed.
   * @param {string} type - The format type ('date', 'time', 'datetime-local', 'week', or 'month').
   * @returns {Date} - The parsed Date object.
   */
  parseDate,
  /**
   * Returns the week number of the year for a given date.
   * @param {Date} date - The date object for which to calculate the week number.
   * @returns {number} - The week number.
   */
  getWeekNumber,
  /**
   * Returns the first date (Monday) of a given week in a year.
   * @param {number} year - The year of the target week.
   * @param {number} week - The week number (1-53) of the desired week.
   * @returns {Date} - The first date (Monday) of the specified week.
   */
  getFirstDateOfWeek
};

// src/utils/helpers/fieldValue.js
var dateInput = {
  /**
   * @param {import("../..").InputDateTypes} type
   * @description used to handle parsing ("date", "time", "datetime-local", "week", "month") and the cases of falsy values results to `null` like when clearing the input
   */
  parse: function(type) {
    return function(dateString) {
      return !dateString ? null : inputDateHelpers.parseDate(dateString, type);
    };
  },
  /**
   * @param {import("../..").InputDateTypes} type
   * @description used to handle formatting ("date", "time", "datetime-local", "week", "month") and the cases of falsy values results to '' like when clearing the input
   */
  format: function(type) {
    return function(dateString) {
      return !dateString ? null : inputDateHelpers.formatDate(dateString, type);
    };
  }
};
function onNotNullableTo(defaultValue) {
  return function(value) {
    const symbol = Symbol();
    const isNullable = value ?? symbol;
    if (isNullable !== symbol) {
      return (
        /** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
        defaultValue
      );
    }
    return (
      /** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
      value
    );
  };
}
var onNullable = {
  /**
   * @template Value
   * @param {Value} value
   */
  toEmptyString: function(value) {
    return (
      /** @type {OnNullableDefaultReturn<Value, "">} */
      value ?? ""
    );
  },
  /**
   * @template Value
   * @param {Value} value
   */
  toUndefined: function(value) {
    return (
      /** @type {OnNullableDefaultReturn<Value, undefined>} */
      value ?? void 0
    );
  },
  /**
   * @template Value
   * @param {Value} value
   */
  toNull: function(value) {
    return (
      /** @type {OnNullableDefaultReturn<Value, null>} */
      value ?? null
    );
  },
  /**
   * @template DefaultValue
   * @param {DefaultValue} defaultValue
   */
  to: function(defaultValue) {
    return function(value) {
      const symbol = Symbol();
      const isNullable = value ?? symbol;
      if (isNullable === symbol) {
        return (
          /** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
          defaultValue
        );
      }
      return (
        /** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
        value
      );
    };
  },
  falsy: {
    /**
     * @template Value
     * @param {Value} value
     */
    toEmptyString: function(value) {
      return onNotNullableTo(
        /** @type {""} */
        ""
      )(value);
    },
    /**
     * @template Value
     * @param {Value} value
     */
    toUndefined: function(value) {
      return onNotNullableTo(void 0)(value);
    },
    /**
     * @template Value
     * @param {Value} value
     */
    toNull: function(value) {
      return onNotNullableTo(null)(value);
    },
    /**
     * @template DefaultValue
     * @param {DefaultValue} defaultValue
     */
    to: onNotNullableTo
  }
};
function onFalsyTo(defaultValue) {
  return function(value) {
    return (
      /** @type {OnFalsyDefaultReturn<Value, DefaultValue>} */
      !value ? defaultValue : value
    );
  };
}
var onFalsy = {
  toEmptyString: onFalsyTo(
    /** @type {""} */
    ""
  ),
  toUndefined: onFalsyTo(void 0),
  toNull: onFalsyTo(null),
  to: onFalsyTo
};
function onTruthyTo(defaultValue) {
  return function(value) {
    return (
      /** @type {OnTruthyDefaultReturn<Value, DefaultValue>} */
      !value ? value : defaultValue
    );
  };
}
var onTruthy = {
  toEmptyString: onTruthyTo(
    /** @type {""} */
    ""
  ),
  toUndefined: onTruthyTo(void 0),
  toNull: onTruthyTo(null),
  to: onTruthyTo
};
var formFieldValueHelpers = {
  onDateInput: dateInput,
  onNullable,
  onFalsy,
  onTruthy
};
var fieldValue_default = formFieldValueHelpers;

// src/utils/index.ts
function createFormStoreMetadata(params, baseId) {
  if (!params.initialValues || typeof params.initialValues !== "object")
    throw new Error("");
  const metadata = {
    baseId,
    formId: `${baseId}-form`,
    fieldsNames: {},
    fieldsNamesMap: {},
    //
    validatedFieldsNames: [],
    validatedFieldsNamesMap: {},
    // //
    manualValidatedFields: [],
    manualValidatedFieldsMap: [],
    // //
    referencedValidatedFields: [],
    referencedValidatedFieldsMap: []
  };
  metadata.fieldsNames = Object.keys(
    params.initialValues
  );
  for (const fieldName of metadata.fieldsNames) {
    metadata.fieldsNamesMap[fieldName] = true;
  }
  for (const key in params.validationsHandlers) {
    metadata.validatedFieldsNames.push(key);
    metadata.validatedFieldsNamesMap[key] = true;
    if (key in metadata.fieldsNamesMap) {
      metadata.referencedValidatedFields.push(
        key
      );
      metadata.referencedValidatedFieldsMap[key] = true;
      continue;
    }
    metadata.manualValidatedFields.push(
      key
    );
    metadata.manualValidatedFieldsMap[
      key
      // as unknown as (typeof metadata)['manualValidatedFieldsMap'][number]
    ] = true;
  }
  return metadata;
}
function createFormStoreValidations(params, metadata) {
  let fieldValidationEvents = {
    submit: true,
    blur: true
  };
  let isFieldHavingPassedValidations = false;
  let fieldValidationEventKey;
  const validations = {};
  for (const fieldName of metadata.validatedFieldsNames) {
    const fieldValidationsHandler = params.validationsHandlers?.[fieldName];
    validations[fieldName] = {
      handler: !fieldValidationsHandler ? void 0 : isZodValidator(fieldValidationsHandler) ? (value) => fieldValidationsHandler.parse(value) : fieldValidationsHandler,
      currentDirtyEventsCounter: 0,
      failedAttempts: 0,
      passedAttempts: 0,
      events: {
        // mount: {  },
        blur: {
          failedAttempts: 0,
          passedAttempts: 0,
          isActive: params.validationEvents?.blur ?? true,
          isDirty: false,
          error: null
        },
        change: {
          failedAttempts: 0,
          passedAttempts: 0,
          isActive: params.validationEvents?.change ?? false,
          isDirty: false,
          error: null
        },
        submit: {
          failedAttempts: 0,
          passedAttempts: 0,
          isActive: params.validationEvents?.submit ?? true,
          isDirty: false,
          error: null
        }
      },
      isDirty: false,
      metadata: { name: fieldName }
    };
    if (params.validationEvents) {
      isFieldHavingPassedValidations = true;
      fieldValidationEvents = {
        ...fieldValidationEvents,
        ...params.validationEvents
      };
    }
    if (isFieldHavingPassedValidations) {
      for (fieldValidationEventKey in fieldValidationEvents) {
        validations[fieldName].events[fieldValidationEventKey].isActive = !!typeof fieldValidationEvents[fieldValidationEventKey];
      }
    }
  }
  return validations;
}
function createFormStoreFields(params, baseId, metadata) {
  const fields = {};
  for (const fieldName of metadata.fieldsNames) {
    fields[fieldName] = new FormStoreField({
      value: params.initialValues[fieldName],
      valueFromFieldToStore: params.valuesFromFieldsToStore?.[fieldName] ? params.valuesFromFieldsToStore[fieldName] : void 0,
      valueFromStoreToField: params.valuesFromStoreToFields?.[fieldName] ? params.valuesFromStoreToFields[fieldName] : void 0,
      id: `${baseId}field-${String(fieldName)}`,
      metadata: {
        name: fieldName,
        initialValue: params.initialValues[fieldName]
      }
    });
  }
  return fields;
}
function _setFieldError(params) {
  return function(currentState) {
    if (!currentState.validations[params.name].events[params.validationEvent].isActive)
      return currentState;
    let currentDirtyFieldsCounter = currentState.currentDirtyFieldsCounter;
    const validation = {
      ...currentState.validations[params.name]
    };
    if (params.message) {
      validation.failedAttempts++;
      validation.events[params.validationEvent].failedAttempts++;
      if (!validation.isDirty) {
        validation.currentDirtyEventsCounter++;
        if (validation.currentDirtyEventsCounter > 0) {
          currentDirtyFieldsCounter++;
        }
      }
      validation.events[params.validationEvent].error = {
        message: params.message
      };
      validation.error = { message: params.message };
      validation.events[params.validationEvent].isDirty = true;
      validation.isDirty = true;
    } else {
      validation.passedAttempts++;
      validation.events[params.validationEvent].passedAttempts++;
      if (validation.isDirty) {
        validation.currentDirtyEventsCounter--;
        if (validation.currentDirtyEventsCounter === 0) {
          currentDirtyFieldsCounter--;
        }
      }
      validation.events[params.validationEvent].error = null;
      validation.error = null;
      validation.events[params.validationEvent].isDirty = false;
      validation.isDirty = false;
    }
    currentState.currentDirtyFieldsCounter = currentDirtyFieldsCounter;
    currentState.isDirty = currentDirtyFieldsCounter > 0;
    currentState.validations = {
      ...currentState.validations,
      [params.name]: validation
    };
    return currentState;
  };
}
function _setFieldValue(name, valueOrUpdater) {
  return function(currentState) {
    const field = currentState.fields[name];
    field.value = typeof valueOrUpdater === "function" ? valueOrUpdater(field.value) : valueOrUpdater;
    return {
      ...currentState,
      fields: {
        ...currentState.fields,
        [name]: field
      }
    };
  };
}
var itemsToResetDefaults = {
  fields: true,
  validations: true,
  submit: false,
  focus: true
};
function createFormStoreBuilder(params) {
  const baseId = params.baseId ? `${params.baseId}-` : "";
  const metadata = createFormStoreMetadata(params, baseId);
  const fields = createFormStoreFields(params, baseId, metadata);
  const validations = createFormStoreValidations(params, metadata);
  return (set, get) => {
    return {
      baseId,
      metadata,
      validations,
      fields,
      id: `${baseId}form`,
      isDirty: false,
      submit: {
        counter: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        errorMessage: null,
        isActive: false
      },
      focus: { isActive: false, field: null },
      currentDirtyFieldsCounter: 0,
      getFieldValues() {
        const currentState = get();
        const fieldsValues = {};
        let fieldName;
        for (fieldName in currentState.fields) {
          fieldsValues[fieldName] = currentState.fields[fieldName].value;
        }
        return fieldsValues;
      },
      setSubmitState(valueOrUpdater) {
        set(function(currentState) {
          return {
            // ...currentState,
            submit: {
              ...currentState.submit,
              ...typeof valueOrUpdater === "function" ? valueOrUpdater(currentState.submit) : valueOrUpdater
            }
          };
        });
      },
      setFocusState(fieldName, validationName, isActive) {
        set(function(currentState) {
          let _currentState = currentState;
          if (!isActive && _currentState.validations[validationName].events.blur.isActive) {
            try {
              _currentState.validations[validationName].handler(
                validationName && fieldName !== validationName ? _currentState.getFieldValues() : _currentState.fields[fieldName].value,
                "blur"
              );
              _currentState = _setFieldError(
                {
                  name: validationName,
                  message: null,
                  validationEvent: "blur"
                }
              )(_currentState);
            } catch (error) {
              const message = _currentState.errorFormatter(error, "blur");
              _currentState = _setFieldError(
                {
                  name: validationName,
                  message,
                  validationEvent: "blur"
                }
              )(_currentState);
            }
            if (_currentState.focus.isActive && _currentState.focus.field.name !== fieldName)
              return _currentState;
          }
          return {
            ..._currentState,
            focus: isActive ? {
              isActive: true,
              field: {
                name: fieldName,
                id: _currentState.fields[fieldName].id
              }
            } : { isActive: false, field: null }
          };
        });
      },
      resetFormStore: function(itemsToReset = itemsToResetDefaults) {
        return set(function(currentState) {
          const fields2 = currentState.fields;
          const validations2 = currentState.validations;
          let isDirty = currentState.isDirty;
          let submit = currentState.submit;
          let focus = currentState.focus;
          if (itemsToReset.fields) {
            let fieldName;
            for (fieldName in fields2) {
              fields2[fieldName].value = fields2[fieldName].metadata.initialValue;
            }
          }
          if (itemsToReset.validations) {
            for (const key in validations2) {
              validations2[key].failedAttempts = 0;
              validations2[key].passedAttempts = 0;
              validations2[key].isDirty = false;
              validations2[key].error = null;
              let eventKey;
              for (eventKey in validations2[key].events) {
                validations2[key].events[eventKey].failedAttempts = 0;
                validations2[key].events[eventKey].passedAttempts = 0;
                validations2[key].events[eventKey].isDirty = false;
                validations2[key].events[eventKey].error = null;
              }
            }
            isDirty = false;
          }
          if (itemsToReset.submit) {
            submit = {
              counter: 0,
              passedAttempts: 0,
              failedAttempts: 0,
              errorMessage: null,
              isActive: false
            };
          }
          if (itemsToReset.focus) {
            focus = {
              isActive: false,
              field: null
            };
          }
          return {
            // ...currentState,
            fields: fields2,
            validations: validations2,
            isDirty,
            submit,
            focus
          };
        });
      },
      setFieldValue(name, value) {
        return set(_setFieldValue(name, value));
      },
      setFieldError(params2) {
        set(_setFieldError(params2));
      },
      errorFormatter: params.errorFormatter ?? errorFormatter,
      handleInputChange(name, valueOrUpdater, validationName) {
        let currentState = get();
        const field = currentState.fields[name];
        const _value = typeof valueOrUpdater === "function" ? valueOrUpdater(field.value) : valueOrUpdater;
        const value = field.valueFromFieldToStore ? field.valueFromFieldToStore(_value) : _value;
        const _validationName = validationName ? validationName : (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          currentState.metadata.referencedValidatedFieldsMap[name] ? name : void 0
        );
        const setFieldValue = _setFieldValue;
        const setFieldError = _setFieldError;
        if (_validationName && currentState.validations[_validationName].events["change"].isActive) {
          try {
            currentState = setFieldValue(
              name,
              currentState.validations[_validationName].handler(
                validationName && // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                validationName !== name ? currentState.getFieldValues() : value,
                "change"
              )
            )(currentState);
            currentState = setFieldError({
              name: _validationName,
              message: null,
              validationEvent: "change"
            })(currentState);
          } catch (error) {
            currentState = setFieldError({
              name: _validationName,
              message: currentState.errorFormatter(error, "change"),
              validationEvent: "change"
            })(currentState);
            currentState = setFieldValue(name, value)(currentState);
          }
        } else {
          currentState = setFieldValue(name, value)(currentState);
        }
        set(currentState);
      },
      getFieldEventsListeners(name, validationName) {
        const currentState = get();
        const _validationName = validationName ?? name;
        return {
          onChange: (event) => {
            currentState.handleInputChange(name, event.target.value);
          },
          onFocus: () => {
            currentState.setFocusState(
              name,
              _validationName,
              true
            );
          },
          onBlur: () => {
            currentState.setFocusState(
              name,
              _validationName,
              false
            );
          }
        };
      },
      handleSubmit(cb) {
        return async function(event) {
          event.preventDefault();
          const currentState = get();
          currentState.setSubmitState({ isActive: true });
          const metadata2 = currentState.metadata;
          const fields2 = currentState.fields;
          const validations2 = currentState.validations;
          const values = {};
          const validatedValues = {};
          const errors = {};
          let hasError = false;
          let fieldName;
          for (fieldName in fields2) {
            values[fieldName] = fields2[fieldName].value;
            try {
              const validationSchema = fieldName in metadata2.referencedValidatedFieldsMap && validations2[fieldName].handler;
              if (typeof validationSchema !== "function" || !validations2[fieldName].events.submit.isActive) {
                continue;
              }
              validatedValues[fieldName] = validationSchema(
                fields2[fieldName].value,
                "submit"
              );
              errors[fieldName] = {
                name: fieldName,
                message: null,
                validationEvent: "submit"
              };
            } catch (error) {
              errors[fieldName] = {
                name: fieldName,
                message: currentState.errorFormatter(error, "submit"),
                validationEvent: "submit"
              };
            }
          }
          let manualFieldName;
          for (manualFieldName of metadata2.manualValidatedFields) {
            try {
              const validationSchema = currentState.validations[manualFieldName].handler;
              if (typeof validationSchema !== "function") {
                continue;
              }
              validatedValues[manualFieldName] = validationSchema(
                values,
                "submit"
              );
              errors[manualFieldName] = {
                name: manualFieldName,
                message: null,
                validationEvent: "submit"
              };
            } catch (error) {
              errors[manualFieldName] = {
                name: manualFieldName,
                message: currentState.errorFormatter(error, "submit"),
                validationEvent: "submit"
              };
            }
          }
          let _currentState = get();
          let errorKey;
          for (errorKey in errors) {
            const errorObj = errors[errorKey];
            _currentState = _setFieldError(
              errors[errorKey]
            )(_currentState);
            if (typeof errorObj.message !== "string")
              continue;
            hasError = true;
          }
          if (!hasError) {
            try {
              await cb({
                event,
                values,
                validatedValues,
                hasError,
                errors
              });
              currentState.setSubmitState((prev) => ({
                isActive: false,
                counter: prev.counter + 1,
                passedAttempts: prev.counter + 1,
                errorMessage: null
              }));
            } catch (error) {
              currentState.setSubmitState((prev) => ({
                isActive: false,
                counter: prev.counter + 1,
                failedAttempts: prev.counter + 1,
                errorMessage: currentState.errorFormatter(error, "submit")
              }));
            }
          } else {
            set(_currentState);
            currentState.setSubmitState((prev) => ({
              isActive: false,
              counter: prev.counter + 1,
              failedAttempts: prev.counter + 1,
              errorMessage: null
            }));
          }
        };
      }
    };
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createFormStoreBuilder,
  errorFormatter,
  fvh,
  handleCreateFormStore,
  isZodError,
  isZodValidator,
  useCreateFormStore
});
//# sourceMappingURL=index.js.map