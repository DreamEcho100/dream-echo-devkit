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
      // Should check if it's a number or not
      // ???
      paths.push(Number(currentPath));
      inBracket = false;
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
