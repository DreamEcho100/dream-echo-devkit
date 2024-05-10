/**
 * Credits to: <https://github.com/edmundhung/conform/blob/main/packages/conform-dom/formdata.ts>
 *
 * for the `getPaths`, `formatPaths`, `setValue`, `isPlainObject` and `getValue` implementation
 *
 */

/**
 * Returns the paths from a name based on the JS syntax convention
 * @example
 * ```js
 * const paths = getPaths('todos[0].content'); // ['todos', 0, 'content']
 * ```
 *
 * @param {string} name - The name to get the paths from
 * @returns {(string | number)[]} The paths from the name
 */
export function getPaths(name) {
  if (!name) {
    return [];
  }

  const paths = [];
  let currentPath = "";
  let inBracket = false;

  let i = 0;
  /** @type {string | undefined} */
  let char;
  for (; i < name.length; i++) {
    char = name[i];
    if (char === "." && !inBracket) {
      // End of a path segment
      if (currentPath !== "") {
        paths.push(currentPath);
        currentPath = "";
      }
    } else if (char === "[") {
      // Start of an array index
      if (currentPath !== "") {
        paths.push(currentPath);
        currentPath = "";
      }
      inBracket = true;
    } else if (char === "]" && inBracket) {
      // End of an array index
      inBracket = false;
      paths.push(Number(currentPath));
      currentPath = "";
    } else {
      currentPath += char;
    }
  }

  // Add last segment if there's any
  if (currentPath !== "") {
    if (!inBracket) {
      paths.push(currentPath);
    } else {
      // Handle potential syntax error or assume it's part of the path
      paths.push(Number(currentPath));
    }
  }

  return paths;
}

/**
 * Returns a formatted name from the paths based on the JS syntax convention
 * @example
 * ```js
 * const name = formatPaths(['todos', 0, 'content']); // "todos[0].content"
 * ```
 *
 * @param {(string | number)[]} paths - The paths to format
 * @returns {string} The formatted name
 */
export function formatPaths(paths) {
  let formattedName = "";

  let i = 0;
  /** @type {string | number | undefined} */
  let curr;
  for (; i < paths.length; i++) {
    curr = paths[i];
    if (typeof curr === "number") {
      // Directly append number within brackets
      formattedName += `[${Number.isNaN(curr) ? "" : curr}]`;
    } else {
      // For strings, check if it's the first element or not to prepend a dot
      if (i > 0) {
        formattedName += `.${curr}`;
      } else {
        // First element, just append
        formattedName += curr;
      }
    }
  }

  return formattedName;
}

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

/**
 * Retrieve the value from a target object by following the paths
 *
 * @param {unknown} target
 * @param {string} name
 * @returns {unknown}
 */
export function getValue(target, name) {
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
      return;
    }
  }

  return pointer;
}

export const coerce = {
  toString: String, // (32),
  toNumber: Number, // ("23"),
  toBoolean: Boolean, // ("0"),
  toBigint: BigInt, // ("98798798798798798798798798798798798"),
  /** @param {string | number | Date} input */
  toDate: (input) => new Date(input), //("2021-01-01"),
};
