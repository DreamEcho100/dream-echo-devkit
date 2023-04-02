// export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError } from 'zod';

import { createStore, useStore } from 'zustand';

import type {
	FormStoreApi,
	PassedAllFieldsShape,
	FormStoreShape,
	HandleValidation,
	ValidationEvents,
} from '../types';

const generateUUIDV1 = () => {
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

const generateUUIDV2 = () => {
	const randomValues = new Uint8Array(32);
	crypto.getRandomValues(randomValues);

	let uuid = '';
	let i = 0;
	let value: number;

	for (; i < randomValues.length; i++) {
		if (i === 8 || i === 12 || i === 16 || i === 20) {
			uuid += '-';
		}
		value = randomValues[i];
		if (i === 12) {
			uuid += '4';
		} else if (i === 16) {
			uuid += ((value & 3) | 8).toString(16);
		} else {
			uuid += value.toString(16);
		}
	}
	return uuid;
};

const isFieldValueMulti = <Value,>(
	value: unknown,
): value is PassesFieldMultiValues<Value> =>
	!!(value && typeof value === 'object' && 'value' in value);
// function isFieldValueMulti<T extends FieldValue>(
// 	field: FieldValue | PassesFieldMultiValues<T>,
// ): field is PassesFieldMultiValues<T> {
// 	return (field as PassesFieldMultiValues<T>).value !== undefined;
// }
// function isFieldValueMulti<T extends FieldValue>(
// 	field: FieldValue | PassesFieldMultiValues<T>,
// ): field is PassesFieldMultiValues<T> {
// 	return (field as PassesFieldMultiValues<T>) instanceof Object;
// }
// function isFieldValueMulti<T extends FieldValue>(
// 	field: FieldValue | PassesFieldMultiValues<T>,
// ): field is PassesFieldMultiValues<T> {
// 	return Object.prototype.toString.call(field) === '[object Object]';
// }

type PassesFieldMultiValues<Value = unknown> = {
	value: Value;
	validationHandler?: HandleValidation<Value>;
	validation?: {
		[key in ValidationEvents]?: boolean;
	};
};
export const createFormStore = <
	PassedFields extends Record<string, unknown>,
>(params: {
	fields:
		| PassedFields
		| {
				[Key in keyof PassedFields]: PassesFieldMultiValues<PassedFields[Key]>;
		  };
	baseId?: string;
	validation?: {
		[key in ValidationEvents]?: boolean;
	};
	trackValidationHistory?: boolean;
}) => {
	type FormStore = FormStoreShape<{
		[Key in keyof PassedFields]: PassedFields[Key] extends PassesFieldMultiValues
			? PassedFields[Key]['value']
			: PassedFields[Key];
	}>;

	const baseId = params.baseId || generateUUIDV2();

	const errors = {};
	const metadata = {
		fieldsNames: Object.keys(params.fields) as (keyof PassedFields)[],
		formId: `${baseId}-form`,
	};
	const submitCounter = 0;

	const fields = {} as FormStore['fields'];

	let fieldName: keyof PassedFields;
	let passedField: (typeof params)['fields'][keyof PassedFields];

	let fieldValue: PassedFields[keyof PassedFields];
	let validation: (typeof fields)[keyof PassedFields]['validation'];
	let passedFieldValidationKey: ValidationEvents;

	for (fieldName of metadata.fieldsNames) {
		validation = {
			failedAttempts: 0,
			passedAttempts: 0,
			events: {
				blur: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				change: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				mount: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				submit: { failedAttempts: 0, passedAttempts: 0, isActive: false },
			},
		};
		passedField = params.fields[fieldName];

		if (params.validation) {
			for (passedFieldValidationKey in params.validation) {
				validation.events[passedFieldValidationKey].isActive =
					!!typeof params.validation[passedFieldValidationKey];
			}
		}

		if (isFieldValueMulti<PassedFields[keyof PassedFields]>(passedField)) {
			fieldValue = passedField.value;
			validation.handler = passedField.validationHandler;
			// validation.events.blur.isActive = !!passedField.validation?.blur;
			// validation.events.change.isActive = !!passedField.validation?.change;
			// validation.events.mount.isActive = !!passedField.validation?.mount;
			// validation.events.submit.isActive = !!passedField.validation?.submit;
			if (passedField.validation) {
				for (passedFieldValidationKey in passedField.validation) {
					validation.events[passedFieldValidationKey].isActive =
						!!typeof passedField.validation[passedFieldValidationKey];
				}
			}
		} else fieldValue = passedField as PassedFields[keyof PassedFields];

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
				id: `${baseId}-field-${String(fieldName)}`,
				name: fieldName,
				initialValue: fieldValue,
			},
			errors: null,
			validation,
		};
	}

	return createStore<FormStore>((set, get) => ({
		fields,
		errors,
		metadata,
		submitCounter,
		isTrackingValidationHistory: !!params.trackValidationHistory,
		validations: { history: [] },
		utils: {
			reInitFieldsValues: () =>
				set((currentState) => {
					const fieldsNames = currentState.metadata.fieldsNames;
					const fields = currentState.fields;

					let fieldName: (typeof fieldsNames)[number];
					for (fieldName of fieldsNames) {
						fields[fieldName] = {
							...fields[fieldName],
							value: fields[fieldName].metadata.initialValue,
						};
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

					field = {
						...field,
						isDirty: hasError,
						errors: params.errors,
						validation: {
							...field.validation,
							events: {
								...field.validation.events,
								[params.validationEvent]: {
									...field.validation.events[params.validationEvent],
									failedAttempts: hasError
										? field.validation.events[params.validationEvent]
												.failedAttempts
										: field.validation.events[params.validationEvent]
												.failedAttempts + 1,
									passedAttempts: hasError
										? field.validation.events[params.validationEvent]
												.passedAttempts
										: field.validation.events[params.validationEvent]
												.passedAttempts + 1,
								},
							},
						},
					};

					return {
						fields: { ...currentState.fields, [params.name]: field },
						errors,
					};
				}),
			createValidationHistoryRecord: () => {},
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

const testStore = createFormStore({
	fields: {
		username: '',
		email: '',
		dateOfBirth: { value: new Date() },
		password: '',
		confirmPassword: '',
	},
});

testStore.getState().metadata.fieldsNames;
testStore.getState().fields.dateOfBirth;
testStore.getState().fields.username;
