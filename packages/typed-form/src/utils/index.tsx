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
	shared?: TFormStoreDataShape<TFields>['shared'];
	fields: TFields;
}) =>
	createStore<TFormStoreDataShape<TFields>>((set) => ({
		shared: {
			validateOnSubmit: true,
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
		// errors: {},
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

// type ExtractState<S> = S extends {
// 	getState: () => infer T
// }
// 	? T
// 	: never
