export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError } from 'zod';

import { createStore, useStore } from 'zustand';

import type {
	FormStoreApi,
	PassedAllFieldsShape,
	FormStoreShape,
	ValidationEvents,
	PassesFieldMultiValues,
	HandleValidation,
	CreateCreateFormStore,
} from '../types';

// Generates a random UUIDv4
const generateUUIDV4 = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});

const isFieldValueMulti = <Value,>(
	value: unknown,
): value is PassesFieldMultiValues<Value> =>
	!!(value && typeof value === 'object' && 'value' in value);

export const createFormStore = <PassedFields extends Record<string, unknown>>({
	isUpdatingFieldsValueOnError: updateFieldsValueOnError = true,
	baseId = generateUUIDV4(),
	trackValidationHistory = false,
	validationsHandler = {},
	...params
}: {
	fields:
		| {
				[Key in keyof PassedFields]:
					| PassesFieldMultiValues<PassedFields[Key]>
					| PassedFields[Key];
		  };
	isUpdatingFieldsValueOnError?: boolean;
	baseId?: string;
	validation?: { [key in ValidationEvents]?: boolean };
	trackValidationHistory?: boolean;
	validationsHandler?: {
		[Key in keyof PassedFields]?: HandleValidation<PassedFields[Key]>;
	};
	errorFormatter?: (
		error: unknown,
		validationEvent: ValidationEvents,
	) => string[];
}): FormStoreApi<PassedFields> => {
	type FormStore = CreateCreateFormStore<PassedFields>;

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
	let passedFieldValidations: NonNullable<typeof params.validation> = {};
	let isFieldHavingPassedValidations = false;
	let passedFieldValidationKey: ValidationEvents;

	// debugger;

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
			isFieldHavingPassedValidations = true;
			passedFieldValidations = {
				...passedFieldValidations,
				...params.validation,
			};
		}

		fields[fieldName] = {} as (typeof fields)[typeof fieldName];

		let isUpdatingValueOnError = updateFieldsValueOnError;

		if (isFieldValueMulti<PassedFields[keyof PassedFields]>(passedField)) {
			fieldValue = passedField.value;
			isUpdatingValueOnError = !!passedField.isUpdatingValueOnError;
			validation.handler =
				passedField.validationHandler || validationsHandler[fieldName];
			fields[fieldName].valueFromFieldToStore =
				passedField.valueFromFieldToStore;
			fields[fieldName].valueFromStoreToField =
				passedField.valueFromStoreToField;
			if (passedField.validation) {
				isFieldHavingPassedValidations = true;
				passedFieldValidations = {
					...passedFieldValidations,
					...passedField.validation,
				};
			}
		} else fieldValue = passedField as PassedFields[keyof PassedFields];
		// as Exclude<typeof passedField, ({ [Key in keyof PassedFields]: PassesFieldMultiValues<PassedFields[Key]>; })[keyof PassedFields]>

		if (isFieldHavingPassedValidations) {
			for (passedFieldValidationKey in passedFieldValidations) {
				validation.events[passedFieldValidationKey].isActive =
					!!typeof passedFieldValidations[passedFieldValidationKey];
			}
		}

		fields[fieldName] = {
			...fields[fieldName],
			value: fieldValue,
			isUpdatingValueOnError,
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
		isTrackingValidationHistory: trackValidationHistory,
		validations: { handler: {}, history: [] },
		utils: {
			errorFormatter: (error, validationEvent) => {
				if (error instanceof ZodError) return error.format()._errors;

				if (error instanceof Error) return [error.message];
				return ['Something went wrong!'];
			},
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
					// debugger;

					return {
						fields: {
							...currentState.fields,
							[name]: {
								...currentState.fields[name],
								value,
							},
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
			createValidationHistoryRecord: ({
				fields,
				validationEvent,
				validationEventPhase,
				validationEventState,
			}) => {
				//
				const logs: string[] = [];
				if (validationEventPhase === 'start') {
					logs.push(
						`Starting the validation for fields: [${Object.keys(fields).join(
							', ',
						)}]`,
					);
				}

				if (validationEventPhase === 'end') {
					logs.push(
						`Ending the validation for fields: [${Object.keys(fields).join(
							', ',
						)}]`,
					);
				}

				logs.push(
					`Validation ${
						validationEventState[0].toUpperCase() +
						validationEventState.slice(1)
					}!`,
				);

				fields.forEach((field) => {
					logs.push(
						`Field: ${String(field.metadata.name)}, Failed Attempts: ${
							field.validation.events[validationEvent].failedAttempts
						}, Passed Attempt: ${
							field.validation.events[validationEvent].passedAttempts
						}`,
					);
				});
			},
			handleFieldValidation: ({ name, validationEvent, value }) => {
				// debugger;
				const currentState = get();

				if (
					!currentState.fields[name].validation.events[validationEvent].isActive
				)
					return value;

				const validationHandler =
					currentState.fields[name].validation.handler ||
					currentState.validations.handler[name];

				if (!validationHandler) return value;

				const valueFromFieldToStore =
					currentState.fields[name].valueFromFieldToStore;
				let validatedValue = valueFromFieldToStore
					? valueFromFieldToStore(value)
					: value;

				let isUpdatingValueOnError =
					currentState.fields[name].isUpdatingValueOnError;

				const handleSetError = (error: unknown) => {
					currentState.utils.setFieldErrors({
						name,
						errors: currentState.utils.errorFormatter(error, validationEvent),
						validationEvent,
					});
					return isUpdatingValueOnError
						? validatedValue
						: currentState.fields[name].value;
				};

				if (currentState.isTrackingValidationHistory) {
					try {
						currentState.utils.createValidationHistoryRecord({
							fields: [currentState.fields[name]],
							validationEvent,
							validationEventPhase: 'start',
							validationEventState: 'processing',
						});

						validatedValue = validationHandler(validatedValue, validationEvent);

						currentState.utils.createValidationHistoryRecord({
							fields: [currentState.fields[name]],
							validationEvent,
							validationEventPhase: 'end',
							validationEventState: 'passed',
						});
					} catch (error) {
						validatedValue = handleSetError(error);
						currentState.utils.createValidationHistoryRecord({
							fields: [currentState.fields[name]],
							validationEvent,
							validationEventPhase: 'end',
							validationEventState: 'failed',
						});
					}
				} else {
					try {
						validatedValue = validationHandler(validatedValue, validationEvent);
					} catch (error) {
						validatedValue = handleSetError(error);
					}
				}

				return validatedValue;
			},
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

// const testStore = createFormStore({
// 	fields: {
// 		username: '',
// 		email: '',
// 		dateOfBirth: { value: new Date() },
// 		password: '',
// 		confirmPassword: '',
// 	},
// });

// testStore.getState().metadata.fieldsNames;
// testStore.getState().fields.dateOfBirth;
// testStore.getState().fields.username.value;
