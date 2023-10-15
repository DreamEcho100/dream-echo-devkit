/**
 * @typedef {undefined | null | false | 0 | ''} FalsyValues
 */

import { inputDateHelpers } from '.';

/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends FalsyValues ? DefaultValue : NonNullable<Value>} OnFalsyDefaultReturn
 */

/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends FalsyValues ? NonNullable<Value> : DefaultValue} OnTruthyDefaultReturn
 */

/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends null | undefined ? DefaultValue : Value} OnNullableDefaultReturn
 */

/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends null | undefined ? Value : DefaultValue} OnNotNullableDefaultReturn
 *
 * @description used to handle parsing and formatting ("date", "time", "datetime-local", "week", "month") and the cases of `null` like when clearing the input
 */
export const dateInput = {
	/**
	 * @param {import("..").InputDateTypes} type
	 * @description used to handle parsing ("date", "time", "datetime-local", "week", "month") and the cases of falsy values results to `null` like when clearing the input
	 */
	parse: function (type) {
		/**
		 * @param {string | number | FalsyValues} dateString
		 */
		return function (dateString) {
			return !dateString ? null : inputDateHelpers.parseDate(dateString, type);
		};
	},
	/**
	 * @param {import("..").InputDateTypes} type
	 * @description used to handle formatting ("date", "time", "datetime-local", "week", "month") and the cases of falsy values results to '' like when clearing the input
	 */
	format: function (type) {
		/**
		 * @param {Date | FalsyValues} dateString
		 */
		return function (dateString) {
			return !dateString ? null : inputDateHelpers.formatDate(dateString, type);
		};
	},
};

/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
export function onNotNullableTo(defaultValue) {
	/**
	 * @template Value
	 * @param {Value} value
	 */
	return function (value) {
		const symbol = Symbol();
		const isNullable = value ?? symbol;

		if (isNullable !== symbol) {
			return (
				/** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
				(defaultValue)
			);
		}

		return (
			/** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
			(value)
		);
	};
}
export const onNullable = {
	/**
	 * @template Value
	 * @param {Value} value
	 */
	toEmptyString: function (value) {
		return (
			/** @type {OnNullableDefaultReturn<Value, "">} */
			(value ?? '')
		);
	},
	/**
	 * @template Value
	 * @param {Value} value
	 */
	toUndefined: function (value) {
		return (
			/** @type {OnNullableDefaultReturn<Value, undefined>} */
			(value ?? undefined)
		);
	},
	/**
	 * @template Value
	 * @param {Value} value
	 */
	toNull: function (value) {
		return (
			/** @type {OnNullableDefaultReturn<Value, null>} */
			(value ?? null)
		);
	},
	/**
	 * @template DefaultValue
	 * @param {DefaultValue} defaultValue
	 */
	to: function (defaultValue) {
		/**
		 * @template Value
		 * @param {Value} value
		 */
		return function (value) {
			const symbol = Symbol();
			const isNullable = value ?? symbol;

			if (isNullable === symbol) {
				return (
					/** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
					(defaultValue)
				);
			}

			return (
				/** @type {OnNullableDefaultReturn<Value, DefaultValue>} */
				(value)
			);
		};
	},
	falsy: {
		/**
		 * @template Value
		 * @param {Value} value
		 */
		toEmptyString: function (value) {
			return onNotNullableTo(
				/** @type {""} */
				(''),
			)(value);
		},
		/**
		 * @template Value
		 * @param {Value} value
		 */
		toUndefined: function (value) {
			return onNotNullableTo(undefined)(value);
		},
		/**
		 * @template Value
		 * @param {Value} value
		 */
		toNull: function (value) {
			return onNotNullableTo(null)(value);
		},
		/**
		 * @template DefaultValue
		 * @param {DefaultValue} defaultValue
		 */
		to: onNotNullableTo,
	},
};

/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
function onFalsyTo(defaultValue) {
	/**
	 * @template Value
	 * @param {Value} value
	 */
	return function (value) {
		return (
			/** @type {OnFalsyDefaultReturn<Value, DefaultValue>} */
			(!value ? defaultValue : value)
		);
	};
}
/**
 * @namespace
 * @property {object} onFalsy
 * @property {<Value>(value: Value) => OnFalsyDefaultReturn<Value, "">} onFalsy.toEmptyString
 * @property {<Value>(value: Value) => OnFalsyDefaultReturn<Value, undefined>} onFalsy.toUndefined
 * @property {<Value>(value: Value) => OnFalsyDefaultReturn<Value, null>} onFalsy.toNull
 * @property {<DefaultValue>(defaultValue: DefaultValue) => <Value>(value: Value) => OnFalsyDefaultReturn<Value, DefaultValue>} onFalsy.to
 */
export const onFalsy = {
	toEmptyString: onFalsyTo(
		/** @type {""} */
		(''),
	),
	toUndefined: onFalsyTo(undefined),
	toNull: onFalsyTo(null),
	to: onFalsyTo,
};

/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
export function onTruthyTo(defaultValue) {
	/**
	 * @template Value
	 * @param {Value} value
	 */
	return function (value) {
		return (
			/** @type {OnTruthyDefaultReturn<Value, DefaultValue>} */
			(!value ? value : defaultValue)
		);
	};
}
/**
 * @namespace
 * @property {object} onTruthy
 * @property {<Value>(value: Value) => OnTruthyDefaultReturn<Value, "">} onTruthy.toEmptyString
 * @property {<Value>(value: Value) => OnTruthyDefaultReturn<Value, undefined>} onTruthy.toUndefined
 * @property {<Value>(value: Value) => OnTruthyDefaultReturn<Value, null>} onTruthy.toNull
 * @property {<DefaultValue>(defaultValue: DefaultValue) => <Value>(value: Value) => OnTruthyDefaultReturn<Value, DefaultValue>} onTruthy.to
 */
export const onTruthy = {
	toEmptyString: onTruthyTo(
		/** @type {""} */
		(''),
	),
	toUndefined: onTruthyTo(undefined),
	toNull: onTruthyTo(null),
	to: onTruthyTo,
};

const formFieldValueHelpers = {
	onDateInput: dateInput,
	onNullable,
	onFalsy,
	onTruthy,
};

export default formFieldValueHelpers;

const test_1 = [1, 2, 3];
const result_1 = {
	to: formFieldValueHelpers.onFalsy.to('lol')(test_1),
	emptyString: formFieldValueHelpers.onFalsy.toEmptyString(test_1),
	null: formFieldValueHelpers.onFalsy.toNull(test_1),
	undefined: formFieldValueHelpers.onFalsy.toUndefined(test_1),
};
result_1;

const test_1_2 = 0;
const result_1_2 = {
	to: formFieldValueHelpers.onFalsy.to('lol')(test_1_2),
	emptyString: formFieldValueHelpers.onFalsy.toEmptyString(test_1_2),
	null: formFieldValueHelpers.onFalsy.toNull(test_1_2),
	undefined: formFieldValueHelpers.onFalsy.toUndefined(test_1_2),
};
result_1_2;

const test_2 = [1, 2, 3];
const result_2 = {
	to: formFieldValueHelpers.onNullable.to('lol')(test_2),
	emptyString: formFieldValueHelpers.onNullable.toEmptyString(test_2),
	null: formFieldValueHelpers.onNullable.toNull(test_2),
	undefined: formFieldValueHelpers.onNullable.toUndefined(test_2),
};
result_2;

const test_2_2 = null;
const result_2_2 = {
	to: formFieldValueHelpers.onNullable.to('lol')(test_2_2),
	emptyString: formFieldValueHelpers.onNullable.toEmptyString(test_2_2),
	null: formFieldValueHelpers.onNullable.toNull(test_2_2),
	undefined: formFieldValueHelpers.onNullable.toUndefined(test_2_2),
};
result_2_2;

const test_3 = [1, 2, 3];
const result_3 = {
	to: formFieldValueHelpers.onNullable.falsy.to('lol')(test_3),
	emptyString: formFieldValueHelpers.onNullable.falsy.toEmptyString(test_3),
	null: formFieldValueHelpers.onNullable.falsy.toNull(test_3),
	undefined: formFieldValueHelpers.onNullable.falsy.toUndefined(test_3),
};
result_3;

const test_3_2 = null;
const result_3_2 = {
	to: formFieldValueHelpers.onNullable.to('lol')(test_3_2),
	emptyString: formFieldValueHelpers.onNullable.toEmptyString(test_3_2),
	null: formFieldValueHelpers.onNullable.toNull(test_3_2),
	undefined: formFieldValueHelpers.onNullable.toUndefined(test_3_2),
};
result_3_2;
