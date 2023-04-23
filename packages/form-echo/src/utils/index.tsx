export { default as inputDateHelpers } from './inputDateHelpers';

import type { ZodSchema, ZodError } from 'zod';

import { useStore, createStore } from 'zustand';

import type {
	FormStoreApi,
	ValidationEvents,
	CreateFormStoreProps,
	CreateCreateFormStore,
} from '../types';

const generateUUIDV4 = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});

const isZodValidator = (validator: unknown): validator is ZodSchema => {
	return !!(
		validator instanceof Object &&
		'parseAsync' in validator &&
		typeof validator.parseAsync === 'function'
	);
};

const isZodError = (error: unknown): error is ZodError => {
	return error instanceof Object && 'errors' in error;
};

export const createFormStore = <
	PassedFields = Record<string, unknown>,
	PassedValidationHandler = Record<keyof PassedFields, unknown>,
>({
	isUpdatingFieldsValueOnError = true,
	trackValidationHistory = false,
	valuesFromFieldsToStore,
	valuesFromStoreToFields,
	validationHandler,
	...params
}: CreateFormStoreProps<PassedFields, PassedValidationHandler>) => {
	type FormStore = CreateCreateFormStore<PassedFields, PassedValidationHandler>;

	if (!params.initValues || typeof params.initValues !== 'object')
		throw new Error('');

	const baseId =
		typeof params.baseId === 'boolean'
			? generateUUIDV4()
			: params.baseId
			? `${params.baseId}-`
			: '';

	const errors = {};
	const metadata = {
		fieldsNames: Object.keys(params.initValues) as (keyof PassedFields)[],
		formId: `${baseId}form`,
	};
	const submitCounter = 0;

	const fields = {} as FormStore['fields'];

	let passedField: (typeof params)['initValues'][keyof PassedFields];

	let validation: (typeof fields)[keyof PassedFields]['validation'];
	let fieldValidationEvents: NonNullable<typeof params.validationEvents> = {
		submit: true,
	};
	let isFieldHavingPassedValidations = false;
	let fieldValidationEventKey: ValidationEvents;

	for (const fieldName of metadata.fieldsNames) {
		const fieldValidationsHandler =
			validationHandler?.[
				fieldName as keyof PassedFields & keyof PassedValidationHandler
			];

		validation = {
			handler: !fieldValidationsHandler
				? undefined
				: isZodValidator(fieldValidationsHandler)
				? (value: unknown) => fieldValidationsHandler.parse(value)
				: fieldValidationsHandler,
			failedAttempts: 0,
			passedAttempts: 0,
			events: {
				blur: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				change: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				mount: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				submit: { failedAttempts: 0, passedAttempts: 0, isActive: false },
			},
		} as NonNullable<typeof validation>;

		passedField = params.initValues[fieldName];

		if (params.validationEvents) {
			isFieldHavingPassedValidations = true;
			fieldValidationEvents = {
				...fieldValidationEvents,
				...params.validationEvents,
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
			for (fieldValidationEventKey in fieldValidationEvents) {
				validation.events[fieldValidationEventKey].isActive =
					!!typeof fieldValidationEvents[fieldValidationEventKey];
			}
		}

		fields[fieldName] = {
			...fields[fieldName],
			errors: null,
			isDirty: false,
			metadata: {
				id: `${baseId}field-${String(fieldName)}`,
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
		validations: { history: [] },
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
			errorFormatter: (error) => {
				if (isZodError(error)) return error.format()._errors;

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
								value:
									typeof value === 'function'
										? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
										  // @ts-ignore
										  (value(
												currentState.fields[name].value,
										  ) as (typeof currentState.fields)[typeof name]['value'])
										: value,
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
					return value as PassedFields[typeof name];

				const validationHandler = currentState.fields[name].validation.handler;

				if (!validationHandler) return value as PassedFields[typeof name];

				const valueFromFieldToStore =
					currentState.fields[name].valueFromFieldToStore;
				let validatedValue = valueFromFieldToStore
					? valueFromFieldToStore(value)
					: value;

				const isUpdatingValueOnError =
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

						validatedValue = validationHandler(
							validatedValue,
							validationEvent,
						) as typeof validatedValue;
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
						validatedValue = validationHandler(
							validatedValue,
							validationEvent,
						) as typeof validatedValue;
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

				return validatedValue as PassedFields[typeof name];
			},
			handlePreSubmit: (cb) => (event) => {
				event.preventDefault();
				if (!cb) return;

				const currentStore = get();
				const fields = currentStore.fields;
				const values = {} as PassedFields;
				const validatedValues = {} as NonNullable<
					Parameters<
						NonNullable<Parameters<FormStore['utils']['handlePreSubmit']>['0']>
					>['1']['validatedValues']
				>;
				const errors = {} as {
					[Key in keyof PassedFields]: {
						name: Key;
						errors: string[] | null;
						validationEvent: ValidationEvents;
					};
				};

				let hasError = false;

				let fieldName: keyof typeof values;
				for (fieldName in fields) {
					try {
						const validationHandler = fields[fieldName].validation.handler;
						if (
							fields[fieldName].validation.events.submit.isActive &&
							typeof validationHandler === 'function'
						) {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							validatedValues[fieldName as keyof typeof validatedValues] =
								validationHandler(fields[fieldName].value, 'submit');
						}
						values[fieldName] = fields[fieldName].value;

						errors[fieldName] = {
							name: fieldName,
							errors: null,
							validationEvent: 'submit',
						};
					} catch (error) {
						errors[fieldName] = {
							name: fieldName,
							errors: currentStore.utils.errorFormatter(error, 'submit'),
							validationEvent: 'submit',
						};

						hasError = true;
					}
				}

				let errorKey: keyof typeof errors;
				for (errorKey in errors) {
					currentStore.utils.setFieldErrors(errors[errorKey]);
				}

				if (!hasError)
					cb(event, {
						values,
						validatedValues,
						hasError,
						errors,
					});
			},
		},
	}));
};

export const useFormStore = <
	fields extends Record<string, unknown>,
	PassedValidatedFields,
	U,
>(
	store: FormStoreApi<fields, PassedValidatedFields>,
	cb: (
		state: FormStoreApi<fields, PassedValidatedFields> extends {
			getState: () => infer T;
		}
			? T
			: never,
	) => U,
) => useStore(store, cb);
