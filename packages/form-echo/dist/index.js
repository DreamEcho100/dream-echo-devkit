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
      parsedDate = /* @__PURE__ */ new Date(dateString + "-01");
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

// src/utils/index.ts
import { ZodError, ZodSchema } from "zod";
import { createStore, useStore } from "zustand";
var generateUUIDV4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === "x" ? r : r & 3 | 8;
  return v.toString(16);
});
var createFormStore = ({
  isUpdatingFieldsValueOnError = true,
  baseId = generateUUIDV4(),
  trackValidationHistory = false,
  valuesFromFieldsToStore,
  valuesFromStoreToFields,
  validationsHandler = {},
  ...params
}) => {
  const errors = {};
  const metadata = {
    fieldsNames: Object.keys(params.initValues),
    formId: `${baseId}-form`
  };
  const submitCounter = 0;
  const fields = {};
  let fieldName;
  let passedField;
  let validation;
  let passedFieldValidations = {};
  let isFieldHavingPassedValidations = false;
  let passedFieldValidationKey;
  let defaultValidationHandler;
  for (fieldName of metadata.fieldsNames) {
    defaultValidationHandler = validationsHandler[fieldName];
    validation = {
      handler: defaultValidationHandler instanceof ZodSchema ? (value) => defaultValidationHandler.parse(value) : defaultValidationHandler,
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
    if (params.validation) {
      isFieldHavingPassedValidations = true;
      passedFieldValidations = {
        ...passedFieldValidations,
        ...params.validation
      };
    }
    fields[fieldName] = {
      value: passedField,
      isUpdatingValueOnError: isUpdatingFieldsValueOnError,
      valueFromFieldToStore: valuesFromFieldsToStore?.[fieldName] ? valuesFromFieldsToStore[fieldName] : void 0,
      valueFromStoreToField: valuesFromStoreToFields?.[fieldName] ? valuesFromStoreToFields[fieldName] : void 0
    };
    if (isFieldHavingPassedValidations) {
      for (passedFieldValidationKey in passedFieldValidations) {
        validation.events[passedFieldValidationKey].isActive = !!typeof passedFieldValidations[passedFieldValidationKey];
      }
    }
    fields[fieldName] = {
      ...fields[fieldName],
      errors: [],
      isDirty: false,
      metadata: {
        id: `${baseId}-field-${String(fieldName)}`,
        name: fieldName,
        initialValue: fields[fieldName].value
      },
      validation
    };
  }
  return createStore((set, get) => ({
    fields,
    errors,
    metadata,
    submitCounter,
    isTrackingValidationHistory: trackValidationHistory,
    validations: { handler: {}, history: [] },
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
      errorFormatter: (error, validationEvent) => {
        if (error instanceof ZodError)
          return error.format()._errors;
        if (error instanceof Error)
          return [error.message];
        return ["Something went wrong!"];
      },
      reInitFieldsValues: () => set((currentState) => {
        const fieldsNames = currentState.metadata.fieldsNames;
        const fields2 = currentState.fields;
        let fieldName2;
        for (fieldName2 of fieldsNames) {
          fields2[fieldName2] = {
            ...fields2[fieldName2],
            value: fields2[fieldName2].metadata.initialValue
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
              value
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
        const validationHandler = currentState.fields[name].validation.handler || currentState.validations.handler[name];
        if (!validationHandler)
          return value;
        const valueFromFieldToStore = currentState.fields[name].valueFromFieldToStore;
        let validatedValue = valueFromFieldToStore ? valueFromFieldToStore(value) : value;
        let isUpdatingValueOnError = currentState.fields[name].isUpdatingValueOnError;
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
            validatedValue = validationHandler(validatedValue, validationEvent);
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
            validatedValue = validationHandler(validatedValue, validationEvent);
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
      }
    }
  }));
};
var useFormStore = (store, cb) => useStore(store, cb);
export {
  createFormStore,
  inputDateHelpers_default as inputDateHelpers,
  useFormStore
};
//# sourceMappingURL=index.js.map