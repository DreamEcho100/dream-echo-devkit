export { default as inputDateHelpers } from './inputDateHelpers';

import { createStore, useStore } from 'zustand';
import type {
	AllFieldsShape,
	FormStoreDataShape,
	FormStoreApi,
	FieldShape,
	AllFieldsShapePartial,
	AllFieldsErrors,
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
 * 	form: {
 * 		errors: {},
 * 		isDirty: false,
 * 		isTouched: false,
 * 		validateAllFieldsOnSubmit: true,
 * 		submitCounter: 0,
 * 	},
 * 	fieldsShared: {
 * 		validateFieldOnSubmit: true,
 * 		fieldErrorFormatter: errFormatter,
 * 	},
 * 	fields: {
 * 		firstName: {
 * 			value: '',
 * 			validationDefaultHandler: isNotEmpty,
 * 			validateOnChange: true,
 * 		},
 * 		lastName: {
 * 			value: '',
 * 			validationDefaultHandler: isNotEmpty,
 * 			validateOnChange: true,
 * 		},
 * 		email: {
 * 			value: '',
 * 			validationDefaultHandler: isEmailValid,
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
		form: {
			errors: (() => {
				const errors = {
					___generic: [],
				} as FormStoreDataShape<TAllFields>['form']['errors'];

				let fieldName: keyof typeof fields;
				for (fieldName in fields) {
					// ! Needs more work
					errors[fieldName] =
						[] as unknown as (typeof errors)[typeof fieldName]; //[] as string[];
				}

				if (Object.keys(errors).length - 1 !== Object.keys(fields).length)
					throw new Error('Invalid fields/errors conversion');

				return errors;
			})(),
			isDirty: false,
			isTouched: false,
			validateAllFieldsOnSubmit: true,
			submitCounter: 0,
			// validateFieldsOnSubmit: true,
			// fieldErrorFormatter: errFormatter,
			...form,
		},

		setFieldValue: ({ name, value }) =>
			set((state: FormStoreDataShape<TAllFields>) => {
				if (name in state.fields) return state;

				const field = state.fields[name];
				let errors = field.errors;
				let isDirty = field.isDirty;
				let validatedValue = value;

				let form = state.form;
				let isFormDirty = form.isDirty;

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

						form = {
							...form,
							errors: {
								...form.errors,
								[name]: errors,
							},
						};

						isDirty = true;
					}
				}

				// Check if the form is dirty based on whether the field has any errors or not.
				isFormDirty =
					isDirty ||
					errors.length !== 0 ||
					!!(form.errors && Object.keys(form.errors).length === 0);
				if (isFormDirty !== form.isDirty)
					form = { ...form, isDirty: isFormDirty };

				// Return the updated state with the new field value and form state.
				return {
					fields: {
						form,
						...state.fields,
						[name]: { ...field, value: validatedValue, errors, isDirty },
					},
				};
			}),
		setFieldsError: (errors) =>
			set((state) => {
				const modifiedFields = Object.keys(errors).map((fieldName) => ({
					...state.fields[fieldName],
					error: errors[fieldName],
					hasValueChangedSinceLastError: false,
				}));

				return {
					fields: {
						...state.fields,
						...modifiedFields,
					},
				};
			}),
		getFieldErrorFormatter: (name) =>
			(name && get().fields[name]?.fieldErrorFormatter) ||
			get().fieldsShared.fieldErrorFormatter,
		getIsFieldIsUncontrolled: (name) => {
			if (typeof get().fields[name].isUncontrolled === 'boolean')
				return get().fields[name].isUncontrolled;
			return get().fieldsShared.isUncontrolled;
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
	if (error instanceof Error) return [error.message];
	return ['Something went wrong!'];
};
