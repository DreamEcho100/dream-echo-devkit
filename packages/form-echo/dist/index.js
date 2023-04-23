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
  createFormStore: () => createFormStore,
  inputDateHelpers: () => inputDateHelpers_default,
  useFormStore: () => useFormStore
});
module.exports = __toCommonJS(src_exports);

// src/utils/inputDateHelpers.ts
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
      formattedDate = date.toISOString().slice(0, 16);
      formattedDate = formattedDate.replace("T", " ");
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
      parsedDate.setHours(Number(hours));
      parsedDate.setMinutes(Number(minutes));
      parsedDate.setSeconds(Number(seconds));
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
var inputDateHelpers_default = inputDateHelpers;

// src/utils/index.tsx
var import_zustand = require("zustand");
var generateUUIDV4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === "x" ? r : r & 3 | 8;
  return v.toString(16);
});
var isZodValidator = (validator) => {
  return !!(validator instanceof Object && "parseAsync" in validator && typeof validator.parseAsync === "function");
};
var isZodError = (error) => {
  return error instanceof Object && "errors" in error;
};
var createFormStore = ({
  isUpdatingFieldsValueOnError = true,
  trackValidationHistory = false,
  valuesFromFieldsToStore,
  valuesFromStoreToFields,
  validationHandler,
  ...params
}) => {
  if (!params.initValues || typeof params.initValues !== "object")
    throw new Error("");
  const baseId = typeof params.baseId === "boolean" ? generateUUIDV4() : params.baseId ? `${params.baseId}-` : "";
  const errors = {};
  const metadata = {
    fieldsNames: Object.keys(params.initValues),
    formId: `${baseId}form`
  };
  const submitCounter = 0;
  const fields = {};
  let passedField;
  let validation;
  let fieldValidationEvents = {
    submit: true
  };
  let isFieldHavingPassedValidations = false;
  let fieldValidationEventKey;
  for (const fieldName of metadata.fieldsNames) {
    const fieldValidationsHandler = validationHandler?.[fieldName];
    validation = {
      handler: !fieldValidationsHandler ? void 0 : isZodValidator(fieldValidationsHandler) ? (value) => fieldValidationsHandler.parse(value) : fieldValidationsHandler,
      failedAttempts: 0,
      passedAttempts: 0,
      events: {
        blur: { failedAttempts: 0, passedAttempts: 0, isActive: false },
        change: { failedAttempts: 0, passedAttempts: 0, isActive: false },
        mount: { failedAttempts: 0, passedAttempts: 0, isActive: false },
        submit: { failedAttempts: 0, passedAttempts: 0, isActive: false }
      }
    };
    passedField = params.initValues[fieldName];
    if (params.validationEvents) {
      isFieldHavingPassedValidations = true;
      fieldValidationEvents = {
        ...fieldValidationEvents,
        ...params.validationEvents
      };
    }
    fields[fieldName] = {
      value: passedField,
      isUpdatingValueOnError: isUpdatingFieldsValueOnError,
      valueFromFieldToStore: valuesFromFieldsToStore?.[fieldName] ? valuesFromFieldsToStore[fieldName] : void 0,
      valueFromStoreToField: valuesFromStoreToFields?.[fieldName] ? valuesFromStoreToFields[fieldName] : void 0
    };
    if (isFieldHavingPassedValidations) {
      for (fieldValidationEventKey in fieldValidationEvents) {
        validation.events[fieldValidationEventKey].isActive = !!typeof fieldValidationEvents[fieldValidationEventKey];
      }
    }
    fields[fieldName] = {
      ...fields[fieldName],
      errors: null,
      isDirty: false,
      metadata: {
        id: `${baseId}field-${String(fieldName)}`,
        name: fieldName,
        initialValue: fields[fieldName].value
      },
      validation
    };
  }
  return (0, import_zustand.createStore)((set, get) => ({
    fields,
    errors,
    metadata,
    submitCounter,
    isTrackingValidationHistory: trackValidationHistory,
    validations: { history: [] },
    utils: {
      handleOnInputChange: (name, value) => {
        const currentStore = get();
        const _value = currentStore.utils.handleFieldValidation({
          name,
          value,
          validationEvent: "change"
        });
        currentStore.utils.setFieldValue(name, _value);
      },
      errorFormatter: (error) => {
        if (isZodError(error))
          return error.format()._errors;
        if (error instanceof Error)
          return [error.message];
        return ["Something went wrong!"];
      },
      reInitFieldsValues: () => set((currentState) => {
        const fieldsNames = currentState.metadata.fieldsNames;
        const fields2 = currentState.fields;
        let fieldName;
        for (fieldName of fieldsNames) {
          fields2[fieldName] = {
            ...fields2[fieldName],
            value: fields2[fieldName].metadata.initialValue
          };
        }
        return { fields: fields2 };
      }),
      setFieldValue: (name, value) => set((currentState) => {
        return {
          fields: {
            ...currentState.fields,
            [name]: {
              ...currentState.fields[name],
              value: typeof value === "function" ? (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                value(
                  currentState.fields[name].value
                )
              ) : value
            }
          }
        };
      }),
      setFieldErrors: (params2) => set((currentState) => {
        const hasError = !!params2.errors;
        let field = currentState.fields[params2.name];
        field = {
          ...field,
          isDirty: hasError,
          errors: params2.errors,
          validation: {
            ...field.validation,
            events: {
              ...field.validation.events,
              [params2.validationEvent]: {
                ...field.validation.events[params2.validationEvent],
                failedAttempts: hasError ? field.validation.events[params2.validationEvent].failedAttempts : field.validation.events[params2.validationEvent].failedAttempts + 1,
                passedAttempts: hasError ? field.validation.events[params2.validationEvent].passedAttempts : field.validation.events[params2.validationEvent].passedAttempts + 1
              }
            }
          }
        };
        return {
          fields: { ...currentState.fields, [params2.name]: field },
          errors
        };
      }),
      createValidationHistoryRecord: ({
        fields: fields2,
        validationEvent,
        validationEventPhase,
        validationEventState
      }) => {
        const logs = [];
        if (validationEventPhase === "start") {
          logs.push(
            `Starting the validation for fields: [${Object.keys(fields2).join(
              ", "
            )}]`
          );
        }
        if (validationEventPhase === "end") {
          logs.push(
            `Ending the validation for fields: [${Object.keys(fields2).join(
              ", "
            )}]`
          );
        }
        logs.push(
          `Validation ${validationEventState[0].toUpperCase() + validationEventState.slice(1)}!`
        );
        fields2.forEach((field) => {
          logs.push(
            `Field: ${String(field.metadata.name)}, Failed Attempts: ${field.validation.events[validationEvent].failedAttempts}, Passed Attempt: ${field.validation.events[validationEvent].passedAttempts}`
          );
        });
      },
      handleFieldValidation: ({ name, validationEvent, value }) => {
        const currentState = get();
        if (!currentState.fields[name].validation.events[validationEvent].isActive)
          return value;
        const validationHandler2 = currentState.fields[name].validation.handler;
        if (!validationHandler2)
          return value;
        const valueFromFieldToStore = currentState.fields[name].valueFromFieldToStore;
        let validatedValue = valueFromFieldToStore ? valueFromFieldToStore(value) : value;
        const isUpdatingValueOnError = currentState.fields[name].isUpdatingValueOnError;
        const handleSetError = (error) => {
          currentState.utils.setFieldErrors({
            name,
            errors: currentState.utils.errorFormatter(error, validationEvent),
            validationEvent
          });
          return isUpdatingValueOnError ? validatedValue : currentState.fields[name].value;
        };
        if (currentState.isTrackingValidationHistory) {
          try {
            currentState.utils.createValidationHistoryRecord({
              fields: [currentState.fields[name]],
              validationEvent,
              validationEventPhase: "start",
              validationEventState: "processing"
            });
            validatedValue = validationHandler2(
              validatedValue,
              validationEvent
            );
            if (currentState.fields[name].isDirty)
              currentState.utils.setFieldErrors({
                name,
                errors: null,
                validationEvent
              });
            currentState.utils.createValidationHistoryRecord({
              fields: [currentState.fields[name]],
              validationEvent,
              validationEventPhase: "end",
              validationEventState: "passed"
            });
          } catch (error) {
            validatedValue = handleSetError(error);
            currentState.utils.createValidationHistoryRecord({
              fields: [currentState.fields[name]],
              validationEvent,
              validationEventPhase: "end",
              validationEventState: "failed"
            });
          }
        } else {
          try {
            validatedValue = validationHandler2(
              validatedValue,
              validationEvent
            );
            if (currentState.fields[name].isDirty)
              currentState.utils.setFieldErrors({
                name,
                errors: null,
                validationEvent
              });
          } catch (error) {
            validatedValue = handleSetError(error);
          }
        }
        return validatedValue;
      },
      handlePreSubmit: (cb) => (event) => {
        event.preventDefault();
        if (!cb)
          return;
        const currentStore = get();
        const fields2 = currentStore.fields;
        const values = {};
        const validatedValues = {};
        const errors2 = {};
        let hasError = false;
        let fieldName;
        for (fieldName in fields2) {
          try {
            const validationHandler2 = fields2[fieldName].validation.handler;
            if (fields2[fieldName].validation.events.submit.isActive && typeof validationHandler2 === "function") {
              validatedValues[fieldName] = validationHandler2(fields2[fieldName].value, "submit");
            }
            values[fieldName] = fields2[fieldName].value;
            errors2[fieldName] = {
              name: fieldName,
              errors: null,
              validationEvent: "submit"
            };
          } catch (error) {
            errors2[fieldName] = {
              name: fieldName,
              errors: currentStore.utils.errorFormatter(error, "submit"),
              validationEvent: "submit"
            };
            hasError = true;
          }
        }
        let errorKey;
        for (errorKey in errors2) {
          currentStore.utils.setFieldErrors(errors2[errorKey]);
        }
        if (!hasError)
          cb(event, {
            values,
            validatedValues,
            hasError,
            errors: errors2
          });
      }
    }
  }));
};
var useFormStore = (store, cb) => (0, import_zustand.useStore)(store, cb);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createFormStore,
  inputDateHelpers,
  useFormStore
});
//# sourceMappingURL=index.js.map