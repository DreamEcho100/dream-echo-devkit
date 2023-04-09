export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError } from 'zod';
import { createStore, useStore } from 'zustand';
import type {
	AllFieldsShapePartial,
	FormStoreDataShape,
	FormStoreApi,
	FieldShape,
	AllFieldsShape,
} from '../_types';

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
			fieldErrorFormatter: errorFormatter,
			...(fieldsShared || {}),
		},
		fields: handleAllFieldsShapePartial(fields),
		errors: (() => {
			const errors = {} as FormStoreDataShape<TAllFields>['errors'];

			let fieldName: keyof typeof fields;
			for (fieldName in fields) {
				errors[fieldName] = [];
			}

			return errors;
		})(),
		values: (() => {
			const values = {} as FormStoreDataShape<TAllFields>['values'];

			let fieldName: keyof typeof fields;
			for (fieldName in fields) {
				values[fieldName] = fields[fieldName]['initialValue'];
			}

			return values;
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
				let values = state.values;

				values[name] = value;

				return {
					values,
				};
			}),
		setFieldsError: (errors) =>
			set((state) => {
				let isFormDirty = !!state?.isDirty;
				let reCheckFormErrorsSize = true;
				const stateErrors = {
					...state.errors,
					...errors,
				};
				const errorsFieldsNames: (keyof typeof errors)[] = Object.keys(errors);

				const modifiedFields = state.fields;

				let isFieldDirty: boolean;
				let fieldNameIterator: keyof typeof modifiedFields;
				for (fieldNameIterator of errorsFieldsNames) {
					// if there is no `error` key then the `errorsFieldsNames` length would be `0`
					(isFieldDirty = errors[fieldNameIterator]!.length > 0), //checkIsFieldDirty(state.fields[fieldName].errors)
						(modifiedFields[fieldNameIterator] = {
							...modifiedFields[fieldNameIterator],
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

export const errorFormatter = (error: unknown): FieldShape['errors'] => {
	if (error instanceof ZodError) return error.format()._errors;

	if (error instanceof Error) return [error.message];
	return ['Something went wrong!'];
};
