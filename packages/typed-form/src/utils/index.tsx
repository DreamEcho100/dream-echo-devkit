export { default as inputDateHelpers } from './inputDateHelpers';

import { createStore, useStore } from 'zustand';
import type {
	TFieldsShape,
	TFormStoreDataShape,
	TFormStoreApi,
} from '../types';

export const createFormStore = <TFields extends TFieldsShape>({
	fields,
	shared,
}: {
	shared?: Partial<TFormStoreDataShape<TFields>['shared']>;
	fields: TFields;
}) =>
	createStore<TFormStoreDataShape<TFields>>((set, get) => ({
		shared: {
			validateOnSubmit: true,
			fieldErrorFormatter: errFormatter,
			...(shared || {}),
		},
		fields,
		setFieldValue: ({ name, value }) =>
			set((state: TFormStoreDataShape<TFields>) => {
				const field = state.fields[name];
				let error: string | undefined;
				let hasValueChangedSinceLastError = field.hasValueChangedSinceLastError;

				if (!field.validateOnChange || !field.handleValidation)
					error = field.error;
				else {
					try {
						field.handleValidation(field.value);
						hasValueChangedSinceLastError = true;
					} catch (err) {
						if (err instanceof Error) {
							error = err.message;
						}
						hasValueChangedSinceLastError = false;
					}
				}

				return {
					fields: {
						...state.fields,
						[name]: { ...field, value, error, hasValueChangedSinceLastError },
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
			get().shared.fieldErrorFormatter,
	}));

export const useFormStore = <TFields extends TFieldsShape, U>(
	store: TFormStoreApi<TFields>,
	cb: (
		state: TFormStoreApi<TFields> extends {
			getState: () => infer T;
		}
			? T
			: never,
	) => U,
) => useStore(store, cb);

export const errFormatter = (error: unknown) => {
	if (error instanceof Error) return error.message;
	return 'Something went wrong!';
};
