// Not the most accurate test :P
import {
  getPaths,
  setValue as setValueSecondImplementation,
} from "../utils/index.js";

/**
 * Assign a value to a target object by following the paths
 *
 * @param {Record<string, unknown>} target - The target object to assign the value to (e.g. {})
 * @param {string} name - The name of the property to assign the value to (e.g. "todos[0].content")
 * @param {(currentValue?: any) => unknown} valueFn - The function that returns the value to assign to the property
 * @returns {void}
 */
function setValueFirstImplementation(target, name, valueFn) {
  const paths = getPaths(name);
  const length = paths.length;
  const lastIndex = length - 1;

  let index = -1;
  let pointer = target;

  while (pointer != null && ++index < length) {
    const key = /** @type {string | number} */ (paths[index]);
    const nextKey = paths[index + 1];
    const newValue =
      index != lastIndex
        ? pointer[key] ?? (typeof nextKey === "number" ? [] : {})
        : valueFn(pointer[key]);

    pointer[key] = newValue;
    pointer = /** @type {any} */ (pointer[key]);
  }
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

{
  const target1 = { todos: [] };
  const target2 = { todos: [] };
  const name = "todos[0].content";
  let value = "Hello World";
  const valueFn = (/** @type {{ [x: string]: string; }} */ currentValue) => {
    console.log("currentValue", currentValue);
    return value;
  };
  // (/** @type {number | undefined} */ currentValue) =>
  // currentValue !== undefined ? currentValue + 1 : 1;

  console.log("name: ", name);
  console.log("valueFn: ", valueFn);

  console.log("target1: ", target1);
  setValueFirstImplementation(target1, name, valueFn),
    console.log("setValueFirstImplementation({}, name, valueFn): ", target1);

  console.log("target2: ", target2);
  setValueSecondImplementation(target2, name, valueFn),
    console.log("setValueSecondImplementation({}, name, valueFn): ", target2);
  console.log("\n");
}

const name = "todos[0].content";
const valueFn = (/** @type {number | undefined} */ currentValue) =>
  currentValue !== undefined ? currentValue + 1 : 1;

const iterations = 1_000_000;
const target1 = {};
const input1 = [target1, name, valueFn];
const target2 = {};
const input2 = [target2, name, valueFn];
const timeSetValueSecondImplementation = benchmark(
  setValueSecondImplementation,
  input2,
  iterations,
);

const timeSetValueFirstImplementation = benchmark(
  setValueFirstImplementation,
  input1,
  iterations,
);

console.log(
  `Set value first implementation version took: ${timeSetValueFirstImplementation}ms`,
);
console.log(
  `Set value second implementation version took: ${timeSetValueSecondImplementation}ms`,
);
