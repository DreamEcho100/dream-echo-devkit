// import { createStore } from 'zustand';
import type {
	CreateCreateFormStore,
	CreateFormStoreProps,
	ValidationEvents,
} from '../types';
import { generateUUIDV4, isZodError, isZodValidator } from './internals';

type SetStateInternal<T> = (
	partial: T | Partial<T> | ((state: T) => T | Partial<T>),
	// replace?: boolean | undefined,
) => void;

export const CreateFormStoreBuilder = <
	FieldsValues, // = Record<string, unknown>,
	ValidationsHandlers, // = Record<keyof Fields, unknown>,
>({
	isUpdatingFieldsValueOnError = true,
	trackValidationHistory = false,
	valuesFromFieldsToStore,
	valuesFromStoreToFields,
	validationSchema: passedValidationSchema,
	...params
}: CreateFormStoreProps<FieldsValues, ValidationsHandlers>): ((
	set: SetStateInternal<
		CreateCreateFormStore<FieldsValues, ValidationsHandlers>
	>,
	get: () => CreateCreateFormStore<FieldsValues, ValidationsHandlers>,
) => CreateCreateFormStore<FieldsValues, ValidationsHandlers>) => {
	type FormStore = CreateCreateFormStore<FieldsValues, ValidationsHandlers>;

	return (set: SetStateInternal<FormStore>, get: () => FormStore) => ({
		fields,
		metadata,
		submitCounter,
		isTrackingValidationHistory: trackValidationHistory,
		validations: { history: [] },
		errors: {},
		utils: {
			resetFieldsErrors: () =>
				set((prev) => {
					const fields = Object.fromEntries(
						prev.metadata.fieldsNames.map((fieldsName) => [
							fieldsName,
							{
								...prev.fields[fieldsName],
								errors: null,
								isDirty: false,
							},
						]),
					);

					return {
						fields: fields as unknown as typeof prev.fields,
						errors: {},
					};
				}),
			handleOnInputChange: (name, value) => {
				const currentStore = get();
				const _value = currentStore.utils.handleFieldValidation({
					name,
					value,
					validationEvent: 'change',
				}).value;
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

					if (!(params.name in currentState.fields))
						return {
							...currentState,
							errors: { ...currentState.errors, [params.name]: params.errors },
						};

					let field = currentState.fields[params.name as keyof FieldsValues];

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
						errors: { ...currentState.errors, [params.name]: params.errors },
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
			handleFieldValidation: ({ name, validationEvent, value: _value }) => {
				const currentState = get();

				type DV = Exclude<
					FieldsValues[typeof name],
					(value: FieldsValues[typeof name]) => FieldsValues[typeof name]
				>;
				const valueFromFieldToStore =
					currentState.fields[name].valueFromFieldToStore;

				const value = (
					typeof _value === 'function'
						? _value(currentState.fields[name].value)
						: valueFromFieldToStore
						? valueFromFieldToStore(_value)
						: _value
				) as DV;

				if (
					!currentState.fields[name].validation.events[validationEvent].isActive
				)
					return { value, validatedValue: undefined };

				const validationSchema = currentState.fields[name].validation.handler;

				if (!validationSchema) return { value, validatedValue: undefined };

				let validatedValue = value;

				const handleSetError = (error: unknown) => {
					currentState.utils.setFieldErrors({
						name,
						errors: currentState.utils.errorFormatter(error, validationEvent),
						validationEvent,
					});
					return currentState.fields[name].isUpdatingValueOnError
						? validatedValue
						: currentState.fields[name].value;
				};

				if (currentState.isTrackingValidationHistory) {
					try {
						currentState.utils.createValidationHistoryRecord({
							fields: [currentState.fields[name as keyof FieldsValues]],
							validationEvent,
							validationEventPhase: 'start',
							validationEventState: 'processing',
						});

						validatedValue = validationSchema(
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
							fields: [currentState.fields[name as keyof FieldsValues]],
							validationEvent,
							validationEventPhase: 'end',
							validationEventState: 'passed',
						});
					} catch (error) {
						validatedValue = handleSetError(error);
						currentState.utils.createValidationHistoryRecord({
							fields: [currentState.fields[name as keyof FieldsValues]],
							validationEvent,
							validationEventPhase: 'end',
							validationEventState: 'failed',
						});
					}
				} else {
					try {
						validatedValue = validationSchema(
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

				// return validatedValue;
				return { value, validatedValue: undefined };
			},
			handlePreSubmit: (cb) => async (event) => {
				event.preventDefault();
				if (!cb) return;

				const currentStore = get();
				const fields = currentStore.fields;
				const values: Record<string, unknown> = {}; // as Fields;
				const validatedValues: Record<string, unknown> = {};

				const errors: Record<string, unknown> = {};

				let hasError = false;

				// let formFieldName: keyof typeof fields & string;
				// for (formFieldName in fields) {
				// 	values[formFieldName] = fields[formFieldName].value;
				// }

				let fieldName: keyof typeof fields & string; // (typeof metadata)['referencedValidatedFieldsMap'];
				for (fieldName in fields) {
					values[fieldName] = fields[fieldName].value;
					try {
						const validationSchema =
							fieldName in metadata.referencedValidatedFieldsMap &&
							fields[fieldName].validation.handler;
						if (
							fields[fieldName].validation.events.submit.isActive &&
							typeof validationSchema === 'function'
						) {
							validatedValues[fieldName] = validationSchema(
								fields[fieldName].value,
								'submit',
							);
						}

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

						// hasError = true;
					}
				}

				let manualFieldName: keyof (typeof metadata)['manualValidatedFieldsMap'];
				for (manualFieldName of metadata.manualValidatedFields) {
					try {
						const validationSchema = passedValidationSchema[
							manualFieldName
						] as (
							fields: FieldsValues,
							validationEvent: ValidationEvents,
						) => unknown;
						if (typeof validationSchema === 'function') {
							validatedValues[manualFieldName as string] = validationSchema(
								values as FieldsValues,
								'submit',
							);
						}

						errors[manualFieldName as string] = {
							name: manualFieldName,
							errors: null,
							validationEvent: 'submit',
						};
					} catch (error) {
						errors[manualFieldName as string] = {
							name: manualFieldName,
							errors: currentStore.utils.errorFormatter(error, 'submit'),
							validationEvent: 'submit',
						};

						// hasError = true;
					}
				}

				type NecessaryEvil = {
					values: FieldsValues;
					validatedValues: NonNullable<
						Parameters<
							NonNullable<
								Parameters<FormStore['utils']['handlePreSubmit']>['0']
							>
						>['1']['validatedValues']
					>;
					errors: {
						[Key in keyof (typeof metadata)['validatedFieldsNamesMap']]: {
							name: Key;
							errors: string[] | null;
							validationEvent: ValidationEvents;
						};
					};
				};

				let errorKey: keyof typeof errors & string;
				for (errorKey in errors) {
					const errorObj = errors[
						errorKey
					] as NecessaryEvil['errors'][keyof NecessaryEvil['errors']];

					if (
						!errorObj ||
						typeof errorObj !== 'object' ||
						!Array.isArray(errorObj.errors) ||
						errorObj.errors.length === 0
					)
						continue;

					hasError = true;
					currentStore.utils.setFieldErrors(
						errors[
							errorKey
						] as NecessaryEvil['errors'][keyof NecessaryEvil['errors']],
					);
				}

				if (hasError) return;

				await cb(event, {
					values: values as NecessaryEvil['values'],
					validatedValues: validatedValues as NecessaryEvil['validatedValues'],
					hasError,
					errors: errors as NecessaryEvil['errors'],
				});
			},
		},
	});
};
