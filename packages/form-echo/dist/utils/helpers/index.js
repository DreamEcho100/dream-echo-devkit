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

// src/utils/helpers/index.js
var helpers_exports = {};
__export(helpers_exports, {
  formFieldValueHelpers: () => fieldValue_default,
  inputDateHelpers: () => inputDateHelpers,
  onFalsy: () => onFalsy,
  onNullable: () => onNullable,
  onTruthy: () => onTruthy
});
module.exports = __toCommonJS(helpers_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formFieldValueHelpers,
  inputDateHelpers,
  onFalsy,
  onNullable,
  onTruthy
});
//# sourceMappingURL=index.js.map