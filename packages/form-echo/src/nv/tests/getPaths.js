import { getPaths as getPathsManualForLoop } from "../utils/index.js";

/**
 * Returns the paths from a name based on the JS syntax convention
 * @example
 * ```js
 * const paths = getPaths('todos[0].content'); // ['todos', 0, 'content']
 * ```
 *
 * @param {string} name - The name to get the paths from
 * @returns {Array<string | number>} The paths from the name
 */
function getPathsRegex(name) {
  if (!name) {
    return [];
  }

  return name.split(/\.|(\[\d*\])/).reduce((result, segment) => {
    if (typeof segment !== "undefined" && segment !== "") {
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const index = segment.slice(1, -1);

        result.push(Number(index));
      } else {
        result.push(segment);
      }
    }
    return result;
  }, /** @type {Array<string | number>} */ ([]));
}

/**
 * Returns the paths from a name based on the JS syntax convention using a for-of loop.
 * @example
 * ```js
 * const paths = getPathsForOf('todos[0].content'); // ['todos', 0, 'content']
 * ```
 *
 * @param {string} name - The name to get the paths from
 * @returns {Array<string | number>} The paths from the name
 */
function getPathsForOf(name) {
  if (!name) {
    return [];
  }

  const paths = [];
  let currentPath = "";
  let inBracket = false;

  for (const char of name) {
    if (char === "." && !inBracket) {
      // End of a path segment
      if (currentPath !== "") {
        paths.push(currentPath);
        currentPath = "";
      }
    } else if (char === "[") {
      // Start of an array index, push and clear currentPath if not empty
      if (currentPath !== "") {
        paths.push(currentPath);
        currentPath = "";
      }
      inBracket = true;
    } else if (char === "]" && inBracket) {
      // End of an array index, convert currentPath to Number
      inBracket = false;
      paths.push(Number(currentPath));
      currentPath = "";
    } else {
      // Accumulate characters into currentPath
      currentPath += char;
    }
  }

  // Catch any trailing path segment outside of loops
  if (currentPath !== "") {
    if (!inBracket) {
      paths.push(currentPath);
    } else {
      // Last segment incomplete, but treat as numeric index if in brackets
      paths.push(Number(currentPath));
    }
  }

  return paths;
}

{
  const name = "todos[0].content";

  console.log("getPathsRegex(name): ", getPathsRegex(name));
  console.log("getPathsForOf(name): ", getPathsForOf(name));
  console.log("getPathsManual(name): ", getPathsManualForLoop(name));
  console.log("\n");
}

/**
 * @param {Function} func
 * @param {unknown[]} input
 * @param {number} iterations
 */
function benchmark(func, input, iterations = 1_000_000) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    func(...input);
  }
  const end = performance.now();
  return end - start;
}

const input = ["todos[0].content"];
const iterations = 1_000_000;

const timeRegex = benchmark(getPathsRegex, input, iterations);
const timeManualForOf = benchmark(getPathsForOf, input, iterations);
const timeManualForLoop = benchmark(getPathsManualForLoop, input, iterations);

console.log(`Regex version took: ${timeRegex}ms`);
console.log(`Manual for of version took: ${timeManualForOf}ms`);
console.log(`Manual for loop version took: ${timeManualForLoop}ms`);
