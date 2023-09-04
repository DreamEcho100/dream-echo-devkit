import { type ZodError, type ZodSchema } from 'zod';

export function isZodValidator(validator: unknown): validator is ZodSchema {
	return !!(
		validator instanceof Object &&
		'parseAsync' in validator &&
		typeof validator.parseAsync === 'function'
	);
}

export function isZodError(error: unknown): error is ZodError {
	return error instanceof Object && 'errors' in error;
}

// export const generateUUIDV4 = () =>
// 	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
// 		const r = (Math.random() * 16) | 0;
// 		const v = c === 'x' ? r : (r & 0x3) | 0x8;
// 		return v.toString(16);
// 	});

export function errorFormatter(error: unknown) {
	if (isZodError(error)) return error.format()._errors.join(', ');

	if (error instanceof Error) return error.message;

	return 'Something went wrong!';
}
