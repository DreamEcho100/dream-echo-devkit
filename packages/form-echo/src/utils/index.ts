import { type FormEvent } from 'react';
import {
	type ValidationEvents,
	type CreateFormStoreProps,
	type FormStoreShape,
	type GetFromFormStoreShape,
	// type HandlePreSubmit,
	type HandleSubmitCB,
	type GetValidationValuesFromSchema,
} from '../types';
import { errorFormatter, isZodValidator } from './zod';

export * from './inputDateHelpers';
export * from './zod';
export * from './zustand';

type SetStateInternal<T> = (
	partial: T | Partial<T> | ((state: T) => T | Partial<T>),
	// replace?: boolean | undefined,
) => void;

function createFormStoreMetadata<FieldsValues, ValidationsHandlers>(
	params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>,
	baseId: string,
) {
	type FormStore = FormStoreShape<FieldsValues, ValidationsHandlers>;
	if (!params.initValues || typeof params.initValues !== 'object')
		throw new Error('');

	const metadata = {
		baseId,
		formId: `${baseId}_form`,
		fieldsNames: {},
		fieldsNamesMap: {},
		//
		validatedFieldsNames: [],
		validatedFieldsNamesMap: {},
		// //
		manualValidatedFields: [],
		manualValidatedFieldsMap: [],
		// //
		referencedValidatedFields: [],
		referencedValidatedFieldsMap: [],
	} as unknown as FormStore['metadata'];

	metadata.fieldsNames = Object.keys(
		params.initValues,
	) as typeof metadata.fieldsNames;
	for (const fieldName of metadata.fieldsNames) {
		metadata.fieldsNamesMap[fieldName] = true;
	}
	for (const key in params.validationsSchema) {
		metadata.validatedFieldsNames.push(key);
		metadata.validatedFieldsNamesMap[key] = true;

		if (key in metadata.fieldsNamesMap) {
			metadata.referencedValidatedFields.push(
				key as unknown as (typeof metadata)['referencedValidatedFields'][number],
			);
			metadata.referencedValidatedFieldsMap[
				key as unknown as (typeof metadata)['referencedValidatedFields'][number]
			] = true;
			continue;
		}

		metadata.manualValidatedFields.push(
			key as unknown as (typeof metadata)['manualValidatedFields'][number],
		);
		(metadata.manualValidatedFieldsMap as Record<string, true>)[
			key // as unknown as (typeof metadata)['manualValidatedFieldsMap'][number]
		] = true;
	}

	return metadata;
}

function createFormStoreValidations<FieldsValues, ValidationsHandlers>(
	params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>,
	metadata: FormStoreShape<FieldsValues, ValidationsHandlers>['metadata'],
) {
	type FormStore = FormStoreShape<FieldsValues, ValidationsHandlers>;

	let fieldValidationEvents: NonNullable<typeof params.validationEvents> = {
		submit: true,
	};
	let isFieldHavingPassedValidations = false;
	let fieldValidationEventKey: ValidationEvents;

	const validations: FormStore['validations'] = {} as FormStore['validations'];
	for (const fieldName of metadata.validatedFieldsNames) {
		const fieldValidationsHandler =
			params.validationsSchema?.[
				fieldName as keyof GetFromFormStoreShape<FormStore> &
					keyof GetFromFormStoreShape<FormStore, 'validationHandlers'>
			];

		validations[fieldName] = {
			handler: !fieldValidationsHandler
				? undefined
				: isZodValidator(fieldValidationsHandler)
				? (value: unknown) => fieldValidationsHandler.parse(value)
				: fieldValidationsHandler,
			currentDirtyEventsCounter: 0,
			failedAttempts: 0,
			passedAttempts: 0,
			events: {
				// blur: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				// mount: { failedAttempts: 0, passedAttempts: 0, isActive: false },
				change: {
					failedAttempts: 0,
					passedAttempts: 0,
					isActive: false,
					isDirty: false,
					message: null,
				},
				submit: {
					failedAttempts: 0,
					passedAttempts: 0,
					isActive: false,
					isDirty: false,
					message: null,
				},
			},
			isDirty: false,
			metadata: { name: fieldName },
		} as NonNullable<FormStore['validations'][keyof FormStore['validations']]>;

		if (params.validationEvents) {
			isFieldHavingPassedValidations = true;
			fieldValidationEvents = {
				...fieldValidationEvents,
				...params.validationEvents,
			};
		}

		if (isFieldHavingPassedValidations) {
			for (fieldValidationEventKey in fieldValidationEvents) {
				validations[fieldName].events[fieldValidationEventKey].isActive =
					!!typeof fieldValidationEvents[fieldValidationEventKey];
			}
		}
	}

	return validations;
}

function createFormStoreFields<FieldsValues, ValidationsHandlers>(
	params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>,
	baseId: string,
	metadata: FormStoreShape<FieldsValues, ValidationsHandlers>['metadata'],
) {
	type FormStore = FormStoreShape<FieldsValues, ValidationsHandlers>;

	const isUpdatingValueOnError = params.isUpdatingFieldsValueOnError ?? true;

	const fields = {} as FormStore['fields'];
	for (const fieldName of metadata.fieldsNames) {
		fields[fieldName] = {
			value: params.initValues[fieldName],
			isUpdatingValueOnError,
			valueFromFieldToStore: params.valuesFromFieldsToStore?.[fieldName]
				? params.valuesFromFieldsToStore[fieldName]
				: undefined,
			valueFromStoreToField: params.valuesFromStoreToFields?.[fieldName]
				? params.valuesFromStoreToFields[fieldName]
				: undefined,
			errors: null,
			isDirty: false,
			id: `${baseId}field-${String(fieldName)}`,
			metadata: {
				name: fieldName,
				initialValue: params.initValues[fieldName],
			},
		} as (typeof fields)[typeof fieldName];
	}

	return fields;
}

const itemsToResetDefaults = {
	fields: true,
	validations: true,
	submitCounter: false,
};

// 	{
// isUpdatingFieldsValueOnError = true,
// trackValidationHistory = false,
// valuesFromFieldsToStore,
// valuesFromStoreToFields,
// validationSchema: passedValidationSchema,
// ...params
// 	}
export function createFormStoreBuilder<FieldsValues, ValidationsHandlers>(
	params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>,
) {
	// type FormStore = FormStoreShape<FieldsValues, ValidationsHandlers>;

	const baseId = params.baseId ? `${params.baseId}-` : '';
	const metadata = createFormStoreMetadata(params, baseId);
	const fields = createFormStoreFields(params, baseId, metadata);
	const validations = createFormStoreValidations(params, metadata);

	return (
		set: SetStateInternal<FormStoreShape<FieldsValues, ValidationsHandlers>>,
		get: () => FormStoreShape<FieldsValues, ValidationsHandlers>,
	): FormStoreShape<FieldsValues, ValidationsHandlers> => {
		return {
			baseId,
			metadata,
			validations,
			fields,
			id: `${baseId}-form`,
			isDirty: false,
			isSubmitting: false,
			submitCounter: 0,
			currentDirtyFieldsCounter: 0,
			utils: {
				setIsSubmitting(valueOrUpdater) {
					set(function (currentStore) {
						return {
							...currentStore,
							isSubmitting:
								typeof valueOrUpdater === 'function'
									? valueOrUpdater(currentStore.isSubmitting)
									: valueOrUpdater,
						};
					});
				},
				resetFormStore: function (itemsToReset = itemsToResetDefaults) {
					return set(function (currentState) {
						const fields = currentState.fields;
						const validations = currentState.validations;
						let isDirty = currentState.isDirty;
						let submitCounter = currentState.submitCounter;

						if (itemsToReset.fields) {
							for (const key in fields) {
								fields[key].value = fields[key].metadata.initialValue;
							}
						}

						if (itemsToReset.validations) {
							for (const key in validations) {
								validations[key].failedAttempts = 0;
								validations[key].passedAttempts = 0;
								validations[key].isDirty = false;

								let eventKey: keyof (typeof validations)[typeof key]['events'];
								for (eventKey in validations[key].events) {
									// validations[key].events[eventKey].
									validations[key].events[eventKey].failedAttempts = 0;
									validations[key].events[eventKey].passedAttempts = 0;
									validations[key].events[eventKey].isDirty = false;
									validations[key].events[eventKey].message = null;
								}
							}
							isDirty = false;
						}
						if (itemsToReset.submitCounter) {
							submitCounter = 0;
						}

						return {
							...currentState,
							fields,
							validations,
							isDirty,
							submitCounter,
						};
					});
				},
				// errorFormatter: (error) => {
				// 	if (isZodError(error)) return error.format()._errors;

				// 	if (error instanceof Error) return [error.message];
				// 	return ['Something went wrong!'];
				// },
				setFieldValue(name, value) {
					return set(function (currentState) {
						return {
							fields: {
								...currentState.fields,
								[name]: {
									...currentState.fields[name],
									value:
										typeof value === 'function'
											? (value(
													currentState.fields[name].value,
											  ) as FieldsValues[typeof name])
											: value,
								},
							},
						};
					});
				},
				setFieldErrors(params) {
					set(function (currentState) {
						if (
							!currentState.validations[params.name].events[
								params.validationEvent
							].isActive
						)
							return currentState;

						let currentDirtyFieldsCounter =
							currentState.currentDirtyFieldsCounter;
						const validation = currentState.validations[params.name];

						const isDirty = !!params.error;
						if (isDirty) {
							validation.failedAttempts++;
							if (!validation.events[params.validationEvent].isDirty) {
								validation.currentDirtyEventsCounter++;
								if (
									!validation.isDirty &&
									validation.currentDirtyEventsCounter > 0
								)
									currentDirtyFieldsCounter++;
							}

							validation.events[params.validationEvent].message = params.error;
							validation.events[params.validationEvent].isDirty = isDirty;
							validation.events[params.validationEvent].failedAttempts++;
						} else {
							validation.passedAttempts++;
							if (validation.events[params.validationEvent].isDirty) {
								validation.currentDirtyEventsCounter--;
								if (
									validation.isDirty &&
									validation.currentDirtyEventsCounter === 0
								) {
									currentDirtyFieldsCounter--;
								}
							}

							validation.events[params.validationEvent].message = params.error;
							validation.events[params.validationEvent].isDirty = isDirty;
							validation.events[params.validationEvent].passedAttempts++;
						}

						validation.isDirty = validation.currentDirtyEventsCounter > 0;

						return {
							...currentState,
							currentDirtyFieldsCounter,
							isDirty: currentDirtyFieldsCounter > 0,
							validations: {
								...currentState.validations,
								[params.name]: validation,
							},
						};
					});
				},
				errorFormatter: params.errorFormatter ?? errorFormatter,
				handleOnInputChange(name, valueOrUpdater, validationName) {
					const currentState = get();
					const field = currentState.fields[name];

					const value = (
						typeof valueOrUpdater === 'function'
							? valueOrUpdater(field.value)
							: field.valueFromFieldToStore
							? field.valueFromFieldToStore(valueOrUpdater)
							: valueOrUpdater
					) as FieldsValues[typeof name];

					const _validationName = (
						validationName
							? validationName
							: // eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							currentState.metadata.referencedValidatedFieldsMap[
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore
									name as (typeof currentState)['metadata']['referencedValidatedFieldsMap']
							  ]
							? name
							: undefined
					) as typeof validationName;

					if (
						_validationName &&
						currentState.validations[_validationName].events['change'].isActive
					) {
						try {
							currentState.utils.setFieldValue(
								name,
								currentState.validations[_validationName].handler(
									value,
									'change',
								),
							);
							currentState.utils.setFieldErrors({
								name: _validationName,
								error: null,
								validationEvent: 'change',
							});
						} catch (error) {
							currentState.utils.setFieldErrors({
								name: _validationName,
								error: currentState.utils.errorFormatter(error, 'change'),
								validationEvent: 'change',
							});

							if (field.isUpdatingValueOnError)
								currentState.utils.setFieldValue(name, value);
						}
					} else {
						currentState.utils.setFieldValue(name, value);
					}
				},
				handleSubmit<FieldsValues, ValidationsHandlers>(
					cb: HandleSubmitCB<FieldsValues, ValidationsHandlers>,
				) {
					return async function (
						event: FormEvent<HTMLFormElement>,
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
					): Promise<unknown> | unknown {
						event.preventDefault();
						// if (!cb) return;
						const currentStore = get();

						currentStore.utils.setIsSubmitting(true);

						const metadata = currentStore.metadata;
						const fields = currentStore.fields;
						const validations = currentStore.validations;
						const values: Record<string, unknown> = {}; // as Fields;
						const validatedValues: Record<string, unknown> = {};

						const errors: Record<
							string,
							{
								name: string | number | symbol;
								error: string | null;
								validationEvent: ValidationEvents;
							}
						> = {};

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
									validations[fieldName as unknown as keyof typeof validations]
										.handler;
								if (
									validations[fieldName as unknown as keyof typeof validations]
										.events.submit.isActive &&
									typeof validationSchema === 'function'
								) {
									validatedValues[fieldName] = validationSchema(
										fields[fieldName].value,
										'submit',
									);
								}

								errors[fieldName] = {
									name: fieldName,
									error: null,
									validationEvent: 'submit',
								};
							} catch (error) {
								errors[fieldName] = {
									name: fieldName,
									error: currentStore.utils.errorFormatter(error, 'submit'),
									validationEvent: 'submit',
								};

								// hasError = true;
							}
						}

						let manualFieldName: keyof (typeof metadata)['manualValidatedFieldsMap'];
						for (manualFieldName of metadata.manualValidatedFields) {
							try {
								const validationSchema =
									currentStore.validations[manualFieldName].handler;
								if (typeof validationSchema === 'function') {
									validatedValues[manualFieldName as string] = validationSchema(
										values as FieldsValues,
										'submit',
									);
								}

								errors[manualFieldName as string] = {
									name: manualFieldName,
									error: null,
									validationEvent: 'submit',
								};
							} catch (error) {
								errors[manualFieldName as string] = {
									name: manualFieldName,
									error: currentStore.utils.errorFormatter(error, 'submit'),
									validationEvent: 'submit',
								};

								// hasError = true;
							}
						}

						type NecessaryEvil = {
							values: FieldsValues;
							validatedValues: GetValidationValuesFromSchema<ValidationsHandlers>;
							error: Parameters<
								(typeof currentStore)['utils']['setFieldErrors']
							>[0];
							errors: {
								[Key in keyof ValidationsHandlers]: {
									name: Key;
									error: string | null;
									validationEvent: ValidationEvents;
								};
							};
						};

						let errorKey: keyof typeof errors & string;
						for (errorKey in errors) {
							const errorObj = errors[errorKey]; // as NecessaryEvil['errors'][keyof NecessaryEvil['errors']];

							currentStore.utils.setFieldErrors(
								errors[errorKey] as unknown as NecessaryEvil['error'],
							);

							if (typeof errorObj.error !== 'string') continue;

							hasError = true;
							// currentStore.utils.setFieldErrors(
							// 	errors[errorKey], //  as NecessaryEvil['errors'][keyof NecessaryEvil['errors']],
							// );
						}

						currentStore.utils.setIsSubmitting(false);

						if (hasError) return;

						await cb({
							event,
							values: values as NecessaryEvil['values'],
							validatedValues:
								validatedValues as NecessaryEvil['validatedValues'],
							hasError,
							errors: errors as NecessaryEvil['errors'],
						});
					};
				},
			},
		};
	};
}

// export const handleSubmit = function <FieldsValues, ValidationsHandlers>(
// 	storeGetter: () => FormStoreShape<FieldsValues, ValidationsHandlers>,
// 	cb: HandleSubmitCB<FieldsValues, ValidationsHandlers>,
// ) {
// 	return async function (
// 		event: FormEvent<HTMLFormElement>,
// 		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// 		// @ts-ignore
// 	): Promise<unknown> | unknown {
// 		event.preventDefault();
// 		// if (!cb) return;
// 		const currentStore = storeGetter();

// 		currentStore.utils.setIsSubmitting(true);

// 		const metadata = currentStore.metadata;
// 		const fields = currentStore.fields;
// 		const validations = currentStore.validations;
// 		const values: Record<string, unknown> = {}; // as Fields;
// 		const validatedValues: Record<string, unknown> = {};

// 		const errors: Record<
// 			string,
// 			{
// 				name: string | number | symbol;
// 				error: string | null;
// 				validationEvent: ValidationEvents;
// 			}
// 		> = {};

// 		let hasError = false;

// 		// let formFieldName: keyof typeof fields & string;
// 		// for (formFieldName in fields) {
// 		// 	values[formFieldName] = fields[formFieldName].value;
// 		// }
// 		let fieldName: keyof typeof fields & string; // (typeof metadata)['referencedValidatedFieldsMap'];
// 		for (fieldName in fields) {
// 			values[fieldName] = fields[fieldName].value;
// 			try {
// 				const validationSchema =
// 					fieldName in metadata.referencedValidatedFieldsMap &&
// 					validations[fieldName as unknown as keyof typeof validations].handler;
// 				if (
// 					validations[fieldName as unknown as keyof typeof validations].events
// 						.submit.isActive &&
// 					typeof validationSchema === 'function'
// 				) {
// 					validatedValues[fieldName] = validationSchema(
// 						fields[fieldName].value,
// 						'submit',
// 					);
// 				}

// 				errors[fieldName] = {
// 					name: fieldName,
// 					error: null,
// 					validationEvent: 'submit',
// 				};
// 			} catch (error) {
// 				errors[fieldName] = {
// 					name: fieldName,
// 					error: currentStore.utils.errorFormatter(error, 'submit'),
// 					validationEvent: 'submit',
// 				};

// 				// hasError = true;
// 			}
// 		}

// 		let manualFieldName: keyof (typeof metadata)['manualValidatedFieldsMap'];
// 		for (manualFieldName of metadata.manualValidatedFields) {
// 			try {
// 				const validationSchema =
// 					currentStore.validations[manualFieldName].handler;
// 				if (typeof validationSchema === 'function') {
// 					validatedValues[manualFieldName as string] = validationSchema(
// 						values as FieldsValues,
// 						'submit',
// 					);
// 				}

// 				errors[manualFieldName as string] = {
// 					name: manualFieldName,
// 					error: null,
// 					validationEvent: 'submit',
// 				};
// 			} catch (error) {
// 				errors[manualFieldName as string] = {
// 					name: manualFieldName,
// 					error: currentStore.utils.errorFormatter(error, 'submit'),
// 					validationEvent: 'submit',
// 				};

// 				// hasError = true;
// 			}
// 		}

// 		type NecessaryEvil = {
// 			values: FieldsValues;
// 			validatedValues: GetFromFormStoreShape<
// 				ReturnType<typeof storeGetter>,
// 				'validatedValues'
// 			>;
// 			errors: {
// 				[Key in keyof (typeof metadata)['validatedFieldsNamesMap']]: {
// 					name: Key;
// 					error: string | null;
// 					validationEvent: ValidationEvents;
// 				};
// 			};
// 		};

// 		let errorKey: keyof typeof errors & string;
// 		for (errorKey in errors) {
// 			const errorObj = errors[errorKey]; // as NecessaryEvil['errors'][keyof NecessaryEvil['errors']];

// 			currentStore.utils.setFieldErrors(
// 				errors[
// 					errorKey
// 				] as unknown as NecessaryEvil['errors'][keyof NecessaryEvil['errors']],
// 			);

// 			if (typeof errorObj.error !== 'string') continue;

// 			hasError = true;
// 			// currentStore.utils.setFieldErrors(
// 			// 	errors[errorKey], //  as NecessaryEvil['errors'][keyof NecessaryEvil['errors']],
// 			// );
// 		}

// 		currentStore.utils.setIsSubmitting(false);

// 		if (hasError) return;

// 		await cb({
// 			event,
// 			values: values as NecessaryEvil['values'],
// 			validatedValues: validatedValues as NecessaryEvil['validatedValues'],
// 			hasError,
// 			errors: errors as NecessaryEvil['errors'],
// 		});
// 	};
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// type TFunction = (...args: any[]) => any;
// type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
// 	Exclude<{} | null | undefined, TFunction>;
// export function handleOnInputChange<
// 	FormStore extends FormStoreShape<any, any>,
// 	Name extends keyof GetFromFormStoreShape<FormStore>,
// 	ValidationName extends
// 		| keyof GetFromFormStoreShape<FormStore, 'validatedValues'>
// 		| undefined = undefined,
// >(
// 	storeGetter: () => FormStore,
// 	name: Name,
// 	valueOrUpdater:
// 		| ((
// 				value: GetFromFormStoreShape<FormStore>[Name],
// 		  ) => GetFromFormStoreShape<FormStore>[Name])
// 		| AnyValueExceptFunctions,
// 	validationName?: ValidationName,
// ) {
// }
