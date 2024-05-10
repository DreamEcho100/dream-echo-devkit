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
function getPaths(name) {
	if (!name) {
		return [];
	}

	const paths = [];
	let currentPath = '';
	let inBracket = false;

	let i = 0;
	/** @type {string | undefined} */
	let char;
	for (; i < name.length; i++) {
		char = name[i];
		if (char === '.' && !inBracket) {
			// End of a path segment
			if (currentPath !== '') {
				paths.push(currentPath);
				currentPath = '';
			}
		} else if (char === '[') {
			// Start of an array index
			if (currentPath !== '') {
				paths.push(currentPath);
				currentPath = '';
			}
			inBracket = true;
		} else if (char === ']' && inBracket) {
			// End of an array index
			inBracket = false;
			paths.push(Number(currentPath));
			currentPath = '';
		} else {
			currentPath += char;
		}
	}

	// Add last segment if there's any
	if (currentPath !== '') {
		if (!inBracket) {
			paths.push(currentPath);
		} else {
			// Handle potential syntax error or assume it's part of the path
			paths.push(Number(currentPath));
		}
	}

	return paths;
}

const paths = getPaths('todos[].content');
console.log('paths', paths);
const paths2 = getPaths('todos[0].content');
console.log('paths2', paths2);
const paths3 = getPaths('todos[53].content');
console.log('paths3', paths3);

/**
 * Assign a value to a target object by following the paths.
 *
 * @param {Record<string, any>} target - The target object to assign the value to (e.g. {})
 * @param {string} path - The name of the property to assign the value to (e.g. "todos[0].content")
 * @param {(currentValue?: any) => unknown} valueFn - The function that returns the value to assign to the property
 * @returns {void}
 */
function setValue(target, path, valueFn) {
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
				? pointer[key] ?? (typeof nextKey === 'number' ? [] : {})
				: valueFn(pointer[key]);

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		pointer[key] = newValue;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		pointer = /** @type {any} */ (pointer[key]);
	}
}

const target = {};
setValue(target, 'todos[0].content', () => 'Hello, world!');
console.log('target', target);

const target2 = { todos: [{ content: 'Hello, world!' }, { content: 'Hello!' }] };
setValue(target2, 'todos[1].content', (curr) => curr + '!');
console.log('target2', target2);
