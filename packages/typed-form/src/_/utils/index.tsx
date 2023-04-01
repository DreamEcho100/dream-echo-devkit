// export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError } from 'zod';

import { createStore, useStore } from 'zustand';

import type {
	FormStoreApi,
	PassedAllFieldsShape,
	FormStoreShape,
} from '../types';

const generateUUID4 = () => {
	let uuid = '',
		i = 0,
		random: number;
	for (; i < 32; i++) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		random = (Math.random() * 16) | 0;
		if (i === 12) {
			uuid += '4';
		} else if (i === 16) {
			uuid += ((random & 3) | 8).toString(16);
		} else {
			uuid += random.toString(16);
		}
	}
	return uuid;
};

// typeof structuredClone !== 'undefined'
// 	? structuredClone(baseState)
// 	:
type UpdateFn<T> = (draftState: T) => void;

function produce<T extends object>(baseState: T, updateFn: UpdateFn<T>): T {
	const nextState = { ...baseState };
	updateFn(nextState);
	return nextState;
}

type PassesFieldMultiValues = { value: unknown; baseId?: string };
export const createFormStore = <
	TAllFields extends Record<string, PassesFieldMultiValues | unknown>,
>(params: {
	fields: TAllFields;
}) => {
	type FormStore = FormStoreShape<{
		[Key in keyof TAllFields]: TAllFields[Key] extends PassesFieldMultiValues
			? TAllFields[Key]['value']
			: TAllFields[Key];
	}>;

	const baseId = generateUUID4();

	const errors = {};
	const metadata = {
		fieldsNames: Object.keys(params.fields),
		formId: `${baseId}-form`,
	};
	const submitCounter = 0;

	const fields = {} as FormStore['fields'];

	let fieldName: keyof TAllFields;
	let passedField: TAllFields[keyof TAllFields];
	let fieldValue: (typeof fields)[keyof TAllFields]['value'];
	for (fieldName of metadata.fieldsNames) {
		passedField = params.fields[fieldName];
		if (
			typeof passedField === 'object' &&
			passedField &&
			'value' in passedField
		) {
			fieldValue = passedField.value as typeof fieldValue;
		} else fieldValue = passedField as typeof fieldValue;

		// let value = passedField
		fields[fieldName] = {
			value: fieldValue,
			isDirty: false,
			isTouched: false,
			isVisited: false,
			isDisabled: false,
			isFocused: false,
			isHidden: false,
			isReadOnly: false,
			metadata: {
				id: `${baseId}-field-${
					typeof fieldName === 'string' ? fieldName : String(fieldName) //.toString()
				}`,
				name: fieldName,
				initialValue: fieldValue,
			},
			validation: {
				failedAttempts: 0,
				passedAttempts: 0,
				errors: null,
				events: {
					blur: { failedAttempts: 0, passedAttempts: 0, isActive: false },
					change: { failedAttempts: 0, passedAttempts: 0, isActive: false },
					mount: { failedAttempts: 0, passedAttempts: 0, isActive: false },
					submit: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				},
			},
		};
	}

	return createStore<FormStore>((set, get) => ({
		fields,
		errors,
		metadata,
		submitCounter,
		utils: {
			reInitFieldsValues: () =>
				set((currentState) => {
					const fieldsNames = currentState.metadata.fieldsNames;
					const fields = currentState.fields;

					for (const fieldName of fieldsNames) {
						fields[fieldName].value = fields[fieldName].metadata.initialValue;
					}

					return { fields };
				}),
			setFieldValue: (name, value) =>
				set((currentState) => {
					return {
						fields: {
							...currentState.fields,
							[name]: { ...currentState.fields[name], value },
						},
					};
				}),
			setFieldErrors: (params) =>
				set((currentState) => {
					const hasError = !!params.errors;

					let field = currentState.fields[params.name];
					let fieldValidateEvent =
						field.validation.events[params.validationEventName];
					let errors = currentState.errors;

					field = {
						...field,
						isDirty: hasError,
						validation: {
							...field.validation,
							errors: errors,
							events: {
								...field.validation.events,
								[params.validationEventName]: {
									...fieldValidateEvent,
									failedAttempts: hasError
										? fieldValidateEvent.failedAttempts
										: fieldValidateEvent.failedAttempts + 1,
									passedAttempts: hasError
										? fieldValidateEvent.passedAttempts
										: fieldValidateEvent.passedAttempts + 1,
								},
							},
						},
					};

					return {
						fields: { ...currentState.fields, [params.name]: field },
						errors,
					};
				}),
		},
	}));
};

export const useFormStore = <TAllFields extends PassedAllFieldsShape, U>(
	store: FormStoreApi<TAllFields>,
	cb: (
		state: FormStoreApi<TAllFields> extends {
			getState: () => infer T;
		}
			? T
			: never,
	) => U,
) => useStore(store, cb);

// export const errFormatter = (error: unknown): FieldShape['errors'] => {
// 	if (error instanceof ZodError) return error.format()._errors;

// 	if (error instanceof Error) return [error.message];
// 	return ['Something went wrong!'];
// };
