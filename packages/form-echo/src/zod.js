/**
 * @param {unknown} validator
 * @returns {validator is import("zod").ZodSchema}
 */
export function isZodValidator(validator) {
	return !!(
		validator instanceof Object &&
		'parseAsync' in validator &&
		typeof validator.parseAsync === 'function'
	);
}

/**
 * @param {unknown} error
 * @returns {error is import("zod").ZodError}
 */
export function isZodError(error) {
	return error instanceof Object && 'errors' in error;
}

// export const generateUUIDV4 = () =>
// 	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
// 		const r = (Math.random() * 16) | 0;
// 		const v = c === 'x' ? r : (r & 0x3) | 0x8;
// 		return v.toString(16);
// 	});

/** @param {unknown} error  */
export function errorFormatter(error) {
	if (isZodError(error)) {
		const errors = error.errors.map((err) => err.message);

		return errors.join('\n');
	}

	if (error instanceof Error) return error.message;

	return 'Something went wrong!';
}
