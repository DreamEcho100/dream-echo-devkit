/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends import("./_types").FalsyValues ? NonNullable<Value> : DefaultValue} OnTruthyDefaultReturn
 */

/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
function onTruthyTo(defaultValue) {
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
    (""),
  ),
  toUndefined: onTruthyTo(undefined),
  toNull: onTruthyTo(null),
  to: onTruthyTo,
};

export default onTruthy;
