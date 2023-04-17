export { default as inputDateHelpers } from './inputDateHelpers';

import { ZodError, ZodSchema } from 'zod';

import { createStore, useStore } from 'zustand';

import type {
	FormStoreApi,
	PassedAllFieldsShape,
	ValidationEvents,
	CreateFormStoreProps,
	CreateCreateFormStore,
	HandleValidation,
} from '../types';

const generateUUIDV4 = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});

export const createFormStore = <PassedFields extends Record<string, unknown>>({
	isUpdatingFieldsValueOnError = true,
	baseId = generateUUIDV4(),
	trackValidationHistory = false,
	valuesFromFieldsToStore,
	valuesFromStoreToFields,
	validationsHandler = {},
	...params
}: CreateFormStoreProps<PassedFields>): FormStoreApi<PassedFields> => {
	type FormStore = CreateCreateFormStore<PassedFields>;

	const errors = {};
	const metadata = {
		fieldsNames: Object.keys(params.initValues) as (keyof PassedFields)[],
		formId: `${baseId}-form`,
	};
	const submitCounter = 0;

	const fields = {} as FormStore['fields'];

	// let fieldName: keyof PassedFields;
	let passedField: (typeof params)['initValues'][keyof PassedFields];

	let validation: (typeof fields)[keyof PassedFields]['validation'];
	let passedFieldValidations: NonNullable<typeof params.validation> = {};
	let isFieldHavingPassedValidations = false;
	let passedFieldValidationKey: ValidationEvents;

	for (const fieldName of metadata.fieldsNames) {
		validation = {
			handler:
				validationsHandler[fieldName] instanceof ZodSchema
					? (value, validationEvent) =>
							(validationsHandler[fieldName] as ZodSchema).parse(value)
					: (validationsHandler[fieldName] as HandleValidation<
							PassedFields[typeof fieldName]
					  >),
			failedAttempts: 0,
			passedAttempts: 0,
			events: {
				blur: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				change: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				mount: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				submit: { failedAttempts: 0, passedAttempts: 0, isActive: false },
			},
		};

		passedField = params.initValues[fieldName];

		if (params.validation) {
			isFieldHavingPassedValidations = true;
			passedFieldValidations = {
				...passedFieldValidations,
				...params.validation,
			};
		}

		fields[fieldName] = {
			value: passedField,
			isUpdatingValueOnError: isUpdatingFieldsValueOnError,
			valueFromFieldToStore: valuesFromFieldsToStore?.[fieldName]
				? valuesFromFieldsToStore[fieldName]
				: undefined,
			valueFromStoreToField: valuesFromStoreToFields?.[fieldName]
				? valuesFromStoreToFields[fieldName]
				: undefined,
		} as (typeof fields)[typeof fieldName];

		if (isFieldHavingPassedValidations) {
			for (passedFieldValidationKey in passedFieldValidations) {
				validation.events[passedFieldValidationKey].isActive =
					!!typeof passedFieldValidations[passedFieldValidationKey];
			}
		}

		fields[fieldName] = {
			...fields[fieldName],
			errors: [],
			isDirty: false,
			metadata: {
				id: `${baseId}-field-${String(fieldName)}`,
				name: fieldName,
				initialValue: fields[fieldName].value,
			},
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
			handleOnInputChange: (name, value) => {
				const currentStore = get();
				const _value = currentStore.utils.handleFieldValidation({
					name,
					value,
					validationEvent: 'change',
				});
				currentStore.utils.setFieldValue(name, _value);
			},
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
						if (currentState.fields[name].isDirty)
							currentState.utils.setFieldErrors({
								name,
								errors: null,
								validationEvent,
							});

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
						if (currentState.fields[name].isDirty)
							currentState.utils.setFieldErrors({
								name,
								errors: null,
								validationEvent,
							});
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
