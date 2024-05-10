export { default as onFalsy } from "./on-falsy.js";
export { default as onNullable } from "./on-nullable.js";
export { default as onTruthy } from "./on-truthy.js";

// import { inputDateHelpers } from '.';

// /**
//  * @template Value
//  * @template DefaultValue
//  * @typedef {Value extends null | undefined ? Value : DefaultValue} OnNotNullableDefaultReturn
//  *
//  * @description used to handle parsing and formatting ("date", "time", "datetime-local", "week", "month") and the cases of `null` like when clearing the input
//  */
// export const dateInput = {
// 	/**
// 	 * @param {import("..").InputDateTypes} type
// 	 * @description used to handle parsing ("date", "time", "datetime-local", "week", "month") and the cases of falsy values results to `null` like when clearing the input
// 	 */
// 	parse: function (type) {
// 		/**
// 		 * @param {string | number | FalsyValues} dateString
// 		 */
// 		return function (dateString) {
// 			return !dateString ? null : inputDateHelpers.parseDate(dateString, type);
// 		};
// 	},
// 	/**
// 	 * @param {import("..").InputDateTypes} type
// 	 * @description used to handle formatting ("date", "time", "datetime-local", "week", "month") and the cases of falsy values results to '' like when clearing the input
// 	 */
// 	format: function (type) {
// 		/**
// 		 * @param {Date | FalsyValues} dateString
// 		 */
// 		return function (dateString) {
// 			return !dateString ? null : inputDateHelpers.formatDate(dateString, type);
// 		};
// 	},
// };

// export {
// 	onNullable,
// 	onFalsy,
// 	onTruthy,
// };
// formControlValueHelpers.onFalsy
// export default formControlValueHelpers;
