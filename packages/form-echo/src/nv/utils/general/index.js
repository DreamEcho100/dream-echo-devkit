/**
 * Check if the value is a plain object
 *
 * @param {unknown} obj
 * @returns {obj is Record<string | number | symbol, unknown>}
 */
export function isPlainObject(obj) {
  return (
    !!obj &&
    obj.constructor === Object &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}
