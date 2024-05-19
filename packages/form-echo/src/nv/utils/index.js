import { isPlainObject } from "./general/index.js";
import { getPaths } from "./paths/index.js";

/**
 * Retrieve the value from a target object by following the paths
 *
 * @template Target
 * @template {import("./paths/types.js").DeepPaths<Target>} Name
 *
 * @param {Target} target
 * @param {Name} name
 * @returns {import("./paths/types.js").GetValueByPath<Target, Name>}
 */
export function getValue(target, name) {
  /** @type {unknown} */
  let pointer = target;

  for (const path of getPaths(name)) {
    if (typeof pointer === "undefined" || pointer == null) {
      break;
    }

    if (isPlainObject(pointer) && typeof path === "string") {
      pointer = pointer[path];
    } else if (Array.isArray(pointer) && typeof path === "number") {
      pointer = pointer[path];
    } else {
      pointer = undefined;
      break;
    }
  }

  return /** @type {import("./paths/types.js").GetValueByPath<Target, Name>} */ (
    pointer
  );
}

// getValue(
//   { todos: [{ content: "Hello", test: [] }], lol: { bruh: "xd" } },
//   "todos[2].content",
// );

/**
 * Assign a value to a target object by following the paths.
 *
 * @param {Record<string, any>} target - The target object to assign the value to (e.g. {})
 * @param {string} path - The name of the property to assign the value to (e.g. "todos[0].content")
 * @param {(currentValue?: any) => unknown} valueFn - The function that returns the value to assign to the property
 * @returns {void}
 */
export function setValue(target, path, valueFn) {
  const paths = /** @type {string[]} */ (getPaths(path));
  const length = paths.length;
  const lastIndex = length - 1;

  let index = -1;
  let pointer = target;

  while (pointer != null && ++index < length) {
    const key = /** @type {string | number} */ (paths[index]);
    const nextKey = paths[index + 1];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newValue =
      index != lastIndex
        ? pointer[key] ?? (typeof nextKey === "number" ? [] : {})
        : valueFn(pointer[key]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    pointer[key] = newValue;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    pointer = /** @type {any} */ (pointer[key]);
  }
}

export const coerce = {
  toString: String, // (32),
  toNumber: Number, // ("23"),
  toBoolean: Boolean, // ("0"),
  toBigint: BigInt, // ("98798798798798798798798798798798798"),
  /** @param {string | number | Date} input */
  toDate: (input) => new Date(input), //("2021-01-01"),
};
