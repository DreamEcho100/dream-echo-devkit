// export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError } from 'zod';
import { createStore, useStore } from 'zustand';
import type {
	FormStoreApi,
	PassedAllFieldsShape,
	FormStoreShape,
} from '../types';

function generateUUID4(): string {
	let uuid = '';
	for (let i = 0; i < 32; i++) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		const random = (Math.random() * 16) | 0;
		if (i === 12) {
			uuid += '4';
		} else if (i === 16) {
			uuid += ((random & 3) | 8).toString(16);
		} else {
			uuid += random.toString(16);
		}
	}
	return uuid;
}

type PassesFieldMultiValues = { value: unknown; baseId?: string };
export const createFormStore = <
	TAllFields extends Record<string, PassesFieldMultiValues | unknown>,
>(params: {
	// fieldsShared?: TAllFields['fieldsShared'];
	// form?: TAllFields['form'];
	fields: TAllFields;
}) => {
	type FormStore = FormStoreShape<{
		[Key in keyof TAllFields]: TAllFields[Key] extends PassesFieldMultiValues
			? TAllFields[Key]['value']
			: TAllFields[Key];
	}>;

	const baseId = generateUUID4();

	const form: FormStore['form'] = {
		errors: {},
		metadata: {
			fieldsNames: Object.keys(params.fields),
			id: `${baseId}-form`,
		},
		submitCounter: 0,
	};
	const fields = {} as FormStore['fields'];

	let fieldName: keyof TAllFields;
	let passedField: TAllFields[keyof TAllFields];
	let fieldValue: (typeof fields)[keyof TAllFields]['value'];
	for (fieldName of form.metadata.fieldsNames) {
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
			metadata: {
				id: `${baseId}-field-${
					typeof fieldName === 'string' ? fieldName : fieldName.toString()
				}`,
				name: fieldName,
				initialValue: fieldValue,
			},
			validation: {
				counter: { failed: 0, passed: 0 },
				errors: null,
				events: {
					blur: { counter: { failed: 0, passed: 0 }, isActive: false },
					change: { counter: { failed: 0, passed: 0 }, isActive: false },
					mount: { counter: { failed: 0, passed: 0 }, isActive: false },
					submit: { counter: { failed: 0, passed: 0 }, isActive: false },
				},
			},
		};
	}

	return createStore<FormStore>((set, get) => ({
		fields,
		form,
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
