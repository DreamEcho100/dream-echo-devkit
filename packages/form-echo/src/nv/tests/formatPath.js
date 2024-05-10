import { formatPaths as formatPathsManual } from "../utils/index.js";

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
function formatPathsArrayMethod(paths) {
  return paths.reduce(
    /**
     * @param {string} acc
     * @param {string | number} curr
     * @returns
     */
    (acc, curr) => {
      if (typeof curr === "number") {
        return `${acc}[${Number.isNaN(curr) ? "" : curr}]`;
      }

      if (acc === "" || curr === "") {
        return [acc, curr].join("");
      }

      return [acc, curr].join(".");
    },
    "",
  );
}

{
  const input =
    /** @const */
    ["todos", 0, "content"];
  console.log("input: ", input);
  console.log("formatPathsArrayMethod(input): ", formatPathsArrayMethod(input));
  console.log("formatPathsManual(input): ", formatPathsManual(input));
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

const input = [["todos", 0, "content"]];
const iterations = 1_000_000;

const timeRegex = benchmark(formatPathsArrayMethod, input, iterations);
const timeManual = benchmark(formatPathsManual, input, iterations);

console.log(`Array method version took: ${timeRegex}ms`);
console.log(`Manual method version took: ${timeManual}ms`);
