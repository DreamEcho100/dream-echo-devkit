export { default as inputDateHelpers } from './inputDateHelpers';

import { createStore, useStore } from 'zustand';
import type {
	TAllFieldsShape,
	TFormStoreDataShape,
	TFormStoreApi,
	TFieldShape,
} from '../types';

type TAllFieldsShapePartial<TAllFields extends TAllFieldsShape> = Record<
	keyof TAllFields,
	Pick<TAllFields[keyof TAllFields], 'value'> &
		Partial<
			Omit<
				TAllFields[keyof TAllFields],
				'value' | 'error' | 'isDirty' | 'isTouched'
			>
		>
	// Pick<TAllFields[keyof TAllFields], 'value'> &
	// 	Partial<Pick<
	// 		TAllFields[keyof TAllFields],
	// 		| 'validationDefaultHandler'
	// 		| 'validateOnBlur'
	// 		| 'validateOnChange'
	// 		| 'validateOnMount'
	// 		| 'validateOnSubmit'
	// 		| 'fieldErrorFormatter'
	// 	>>
>;

const handleAllFieldsShapePartial = <TAllFields extends TAllFieldsShape>(
	fields: TAllFieldsShapePartial<TAllFields>,
): TAllFields => {
	const allFields = {} as TAllFields;

	for (const fieldName in fields) {
		/*
			const fieldName: Extract<keyof TAllFields, string>
			Type 'TAllFieldsShapePartial<TAllFields>[Extract<keyof TAllFields, string>] & { errors: []; isDirty: false; isTouched: false; }' is not assignable to type 'TAllFields[Extract<keyof TAllFields, string>]'.
			'TAllFieldsShapePartial<TAllFields>[Extract<keyof TAllFields, string>] & { errors: []; isDirty: false; isTouched: false; }' is assignable to the constraint of type 'TAllFields[Extract<keyof TAllFields, string>]', but 'TAllFields[Extract<keyof TAllFields, string>]' could be instantiated with a different subtype of constraint 'TFieldShape'.ts(2322)
		*/
		allFields[fieldName] = {
			...fields[fieldName],
			errors: [],
			isDirty: false,
			isTouched: false,
		} as (typeof allFields)[typeof fieldName];
	}

	return allFields;
};

export const createFormStore = <TAllFields extends TAllFieldsShape>({
	form,
	fields,
	fieldsShared,
}: {
	form?: Partial<TFormStoreDataShape<TAllFields>['form']>;
	fieldsShared?: Partial<TFormStoreDataShape<TAllFields>['fieldsShared']>;
	fields: TAllFieldsShapePartial<TAllFields>;
}) =>
	createStore<TFormStoreDataShape<TAllFields>>((set, get) => ({
		fieldsShared: {
			validateOnSubmit: true,
			fieldErrorFormatter: errFormatter,
			...(fieldsShared || {}),
		},
		fields: handleAllFieldsShapePartial(fields),
		form: {
			errors: {},
			isDirty: false,
			isTouched: false,
			validateAllFieldsOnSubmit: true,
			submitCounter: 0,
			...form,
		},

		setFieldValue: ({ name, value }) =>
			set((state: TFormStoreDataShape<TAllFields>) => {
				if (name in state.fields) return state;

				const field = state.fields[name];
				let errors = field.errors;
				let isDirty = field.isDirty;
				let validatedValue = value;

				let form = state.form;
				let formErrors: typeof state.form.errors = {};
				let isFormDirty: boolean = form.isDirty;

				let formErrorFieldName: keyof typeof formErrors;
				for (formErrorFieldName in formErrors) {
					if (formErrorFieldName !== name)
						formErrors[formErrorFieldName] =
							state.form.errors[formErrorFieldName];
					else formErrorFieldName;
				}

				if (field.validateOnChange && field.validationDefaultHandler) {
					try {
						validatedValue = field.validationDefaultHandler(field.value);
						isDirty = false;
						// Mutable?
						if (form.errors[name]) {
							delete form.errors[name];
						}
					} catch (err) {
						if (err instanceof Error) {
							const fieldErrorFormatter =
								field.fieldErrorFormatter ||
								get().fieldsShared.fieldErrorFormatter;
							errors = fieldErrorFormatter(err);

							if (name in state.fields && errors.length > 0)
								formErrors[name satisfies keyof TAllFields] = errors;

							form = {
								...form,
								errors: formErrors,
							};
						}
						isDirty = true;
					}
				}

				isFormDirty =
					errors.length !== 0 || Object.keys(form.errors).length === 0;
				if (isFormDirty !== form.isDirty) form = { ...form, isDirty };

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
	}));

export const useFormStore = <TAllFields extends TAllFieldsShape, U>(
	store: TFormStoreApi<TAllFields>,
	cb: (
		state: TFormStoreApi<TAllFields> extends {
			getState: () => infer T;
		}
			? T
			: never,
	) => U,
) => useStore(store, cb);

export const errFormatter = (error: unknown): TFieldShape['errors'] => {
	if (error instanceof Error) return [error.message];
	return ['Something went wrong!'];
};
