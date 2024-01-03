/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends null | undefined ? DefaultValue : Value} OnNullableDefaultReturn
 */

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
const onNullable = {
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

export default onNullable;
