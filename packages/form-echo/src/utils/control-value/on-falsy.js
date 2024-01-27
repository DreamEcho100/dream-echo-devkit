/**
 * @template Value
 * @template DefaultValue
 * @typedef {Value extends import("./_types").FalsyValues ? DefaultValue : NonNullable<Value>} OnFalsyDefaultReturn
 */

/**
 * @template DefaultValue
 * @param {DefaultValue} defaultValue
 */
export function onFalsyTo(defaultValue) {
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
const onFalsy = {
  toEmptyString: onFalsyTo(
    /** @type {""} */
    (""),
  ),
  toUndefined: onFalsyTo(undefined),
  toNull: onFalsyTo(null),
  to: onFalsyTo,
};

export default onFalsy;
