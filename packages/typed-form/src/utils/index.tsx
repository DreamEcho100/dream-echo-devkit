export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError } from 'zod';
import { createStore, useStore } from 'zustand';
import type {
	AllFieldsShapePartial,
	FormStoreDataShape,
	FormStoreApi,
	FieldShape,
	AllFieldsShape,
} from '../types';

const handleAllFieldsShapePartial = <TAllFields extends AllFieldsShape>(
	fields: AllFieldsShapePartial<TAllFields>,
): TAllFields => {
	const allFields = {} as TAllFields;

	for (const fieldName in fields) {
		allFields[fieldName] = {
			...fields[fieldName],
			errors: [],
			isDirty: false,
			isTouched: false,
		} as (typeof allFields)[typeof fieldName];
	}

	return allFields;
};

/**
 * Creates a form store with default values for form data and fields.
 * The store can be used to manage form state and handle form submission and validation.
 *
 * @template TAllFields - The shape of all fields in the form.
 *
 * @param {Object} options - The options to configure the form store.
 * @param {Object} [options.form] - The initial form data.
 * @param {Object} [options.fieldsShared] - The shared options for all fields.
 * @param {Object} options.fields - The shape of all fields in the form.
 *
 * @returns {Object} The form store with its initial state and methods to update it.
 *
 * @example
 * const formStore = createFormStore({
 * 	form: { validateAllFieldsOnSubmit: true },
 * 	fieldsShared: {
 * 		validateFieldOnSubmit: true,
 * 		fieldErrorFormatter: errFormatter,
 * 	},
 * 	fields: {
 * 		firstName: {
 * 			value: '',
 * 			validationDefaultHandler: (value) => z.string().parse(value),
 * 			validateOnChange: true,
 * 		},
 * 		lastName: {
 * 			value: '',
 * 			validationDefaultHandler: (value) => z.string().parse(value),
 * 			validateOnChange: true,
 * 		},
 * 		email: {
 * 			value: '',
 * 			validationDefaultHandler: (value) => z.string().email().parse(value),
 * 			validateOnChange: true,
 * 		},
 * 	},
 * });
 */
export const createFormStore = <TAllFields extends AllFieldsShape>({
	form,
	fields,
	fieldsShared,
}: {
	fieldsShared?: Partial<FormStoreDataShape<TAllFields>['fieldsShared']>;
	form?: Partial<FormStoreDataShape<TAllFields>['form']>;
	fields: AllFieldsShapePartial<TAllFields>;
}) =>
	createStore<FormStoreDataShape<TAllFields>>((set, get) => ({
		fieldsShared: {
			fieldErrorFormatter: errFormatter,
			...(fieldsShared || {}),
		},
		fields: handleAllFieldsShapePartial(fields),
		errors: (() => {
			const errors = {
				___generic: [],
			} as FormStoreDataShape<TAllFields>['errors'];

			let fieldName: keyof typeof fields;
			for (fieldName in fields) {
				// ! Needs more work
				errors[fieldName] = [] as unknown as (typeof errors)[typeof fieldName]; //[] as string[];
			}

			if (Object.keys(errors).length - 1 !== Object.keys(fields).length)
				throw new Error('Invalid fields/errors conversion');

			return errors;
		})(),
		isDirty: false,
		form: {
			isTouched: false,
			validateAllFieldsOnSubmit: true,
			submitCounter: 0,
			...form,
		},

		setFieldValue: ({ name, value }) =>
			set((state: FormStoreDataShape<TAllFields>) => {
				const fields = state.fields;
				const field = fields[name];
				let errors = field.errors;
				let isDirty = field.isDirty;
				let validatedValue = value;

				let form = state.form;
				let isStateDirty = state.isDirty;

				let stateErrors = state.errors;

				// If the field has a validation handler and it is set to validate on change,
				// run the validation handler on the new value.
				if (field.validateOnChange && field.validationDefaultHandler) {
					try {
						validatedValue = field.validationDefaultHandler(field.value);
						errors = field.errors.length === 0 ? field.errors : [];
						isDirty = false;
					} catch (err) {
						// If there is an error during validation, set the field as dirty and
						// set the error in the form state.
						const fieldErrorFormatter =
							field.fieldErrorFormatter ||
							get().fieldsShared.fieldErrorFormatter;
						errors = fieldErrorFormatter(err);

						// If the field has errors, add them to the form errors object
						if (errors.length === 0) {
							throw new Error(
								'No errors were returned!,\nplease check the `fieldErrorFormatter` method.',
							);
						}
						isDirty = true;

						stateErrors = {
							...stateErrors,
							___generic: [],
							[name]: errors,
						};
						isStateDirty = isDirty;
					}
				}

				// Check if the form is dirty based on whether the field has any errors or not.
				isStateDirty = Object.is(state.errors.length, 0);
				if (isStateDirty !== state.isDirty) isStateDirty = isDirty;
				// form = { ...form, isDirty: isFormDirty };

				fields[name] = {
					...field,
					value: validatedValue,
					errors,
					isDirty,
				};

				// Return the updated state with the new field value and form state.
				return {
					form,
					fields,
					errors: stateErrors,
					isDirty: isStateDirty,
				};
			}),
		setFieldsError: (errors) =>
			set((state) => {
				let isFormDirty = !!state?.isDirty;
				let reCheckFormErrorsSize = true;
				// let stateErrors = state.errors;
				const stateErrors = {
					...state.errors,
					...errors,
				};
				const errorsFieldsNames: (keyof typeof errors)[] = Object.keys(errors);

				const modifiedFields = {
					...state.fields,
				};

				let isFieldDirty: boolean;
				let fieldNameIterator: keyof typeof state.fields;
				for (fieldNameIterator of errorsFieldsNames) {
					// if there is no `error` key then the `errorsFieldsNames` length would be `0`
					(isFieldDirty = errors[fieldNameIterator]!.length > 0), //checkIsFieldDirty(state.fields[fieldName].errors)
						(modifiedFields[fieldNameIterator] = {
							...state.fields[fieldNameIterator],
							errors: errors[fieldNameIterator],
							isDirty: isFieldDirty,
						});

					if (isFieldDirty) reCheckFormErrorsSize = false;
				}

				//
				if (reCheckFormErrorsSize) {
					let stateErrorsKey: keyof typeof stateErrors;
					for (stateErrorsKey in stateErrors) {
						if (stateErrors[stateErrorsKey].length > 0) {
							isFormDirty = true;
							break;
						}
					}
				}

				return {
					fields: modifiedFields,
					form: {
						...state.form,
					},
					isDirty: isFormDirty,
					errors: stateErrors,
				};
			}),
		getFieldErrorFormatter: (name) =>
			(name && get().fields[name]?.fieldErrorFormatter) ||
			get().fieldsShared.fieldErrorFormatter,
		// getIsFieldIsUncontrolled: (name) => {
		// 	if (typeof get().fields[name].isUncontrolled === 'boolean')
		// 		return get().fields[name].isUncontrolled;
		// 	return get().fieldsShared.isUncontrolled;
		// },
		getFieldValidateOnChange: (name) => {
			let validateOnChange =
				typeof get().fields[name].validateOnChange === 'function'
					? get().fields[name].validateOnChange
					: typeof get().fieldsShared.validateOnChange === 'function'
					? get().fieldsShared.validateOnChange
					: get().fields[name].validationDefaultHandler;

			if (typeof validateOnChange === 'function') return validateOnChange;
		},
		getIsFieldValidatingOnChange: (name) => {
			return !!(
				get().fields[name].validateOnChange ||
				get().fieldsShared.validateOnChange ||
				get().fields[name].validationDefaultHandler
			);
		},
	}));

export const useFormStore = <TAllFields extends AllFieldsShape, U>(
	store: FormStoreApi<TAllFields>,
	cb: (
		state: FormStoreApi<TAllFields> extends {
			getState: () => infer T;
		}
			? T
			: never,
	) => U,
) => useStore(store, cb);

export const errFormatter = (error: unknown): FieldShape['errors'] => {
	if (error instanceof ZodError) return error.format()._errors;

	if (error instanceof Error) return [error.message];
	return ['Something went wrong!'];
};
