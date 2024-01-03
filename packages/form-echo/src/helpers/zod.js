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

/**
 * @param {unknown} err
 * @returns {import("../types").FormError}
 * */
export function errorFormatter(err) {
	if (isZodError(err)) {
		// /** @type {({ message: string; path: (string | number)[] })[]} */
		// const errors = [];

		// for (const item of err.issues) {
		// 	errors.push({
		// 		message: item.message,
		// 		path: item.path,
		// 	});
		// }

		if (err.formErrors.formErrors.length > 0) {
			return { message: err.formErrors.formErrors[0] };
		}

		return err.errors;
	}

	if (err instanceof Error) return err;

	return { message: 'Something went wrong!' };
}
