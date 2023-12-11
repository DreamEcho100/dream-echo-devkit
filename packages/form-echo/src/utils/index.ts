import FormStoreField from './form-store-field';

import type { FormEvent } from 'react';
import type {
	ValidationEvents,
	CreateFormStoreProps,
	FormStoreShape,
	GetFromFormStoreShape,
	//  HandlePreSubmit,
	HandleSubmitCB,
	GetValidationValuesFromSchema,
	FormStoreShapeBaseMethods,
	ValidValidationSchema,
} from '../types';
import { errorFormatter as defaultErrorFormatter, isZodValidator } from './zod';

export * from './zod';
// export * from './zustand';
// export * from './helpers';

export {
	/**
	 * @description field value helpers
	 */
	default as fvh,
} from './helpers/field-value';

type SetStateInternal<T> = (
	partial: T | Partial<T> | ((state: T) => T | Partial<T>),
) => void;

function createFormStoreMetadata<
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(
	params: CreateFormStoreProps<FieldsValues, ValidationSchema>,
	baseId: string,
) {
	type FormStore = FormStoreShape<FieldsValues, ValidationSchema>;

	if (!params.initialValues || typeof params.initialValues !== 'object')
		throw new Error('');

	const metadata = {
		baseId,
		formId: `${baseId}-form`,
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
		params.initialValues,
	) as typeof metadata.fieldsNames;
	for (const fieldName of metadata.fieldsNames) {
		metadata.fieldsNamesMap[fieldName] = true;
	}

	if (params.validationSchema) {
		for (const key in params.validationSchema) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			metadata.validatedFieldsNames.push(key);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
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
	}

	return metadata;
}

function createFormStoreValidations<
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(
	params: CreateFormStoreProps<FieldsValues, ValidationSchema>,
	metadata: FormStoreShape<FieldsValues, ValidationSchema>['metadata'],
) {
	type FormStore = FormStoreShape<FieldsValues, ValidationSchema>;

	let fieldValidationEvents: NonNullable<typeof params.validationEvents> = {
		submit: true,
		blur: true,
	};
	let isFieldHavingPassedValidations = false;
	let fieldValidationEventKey: ValidationEvents;

	const validations: FormStore['validations'] = {} as FormStore['validations'];

	if (!params.validationSchema) return validations;

	for (const fieldName of metadata.validatedFieldsNames) {
		const fieldValidationsSchema =
			params.validationSchema[
				fieldName as keyof GetFromFormStoreShape<FormStore> &
					keyof GetFromFormStoreShape<FormStore, 'validationSchemas'>
			];

		validations[fieldName] = {
			handler: !fieldValidationsSchema
				? undefined
				: isZodValidator(fieldValidationsSchema)
				? (params: unknown) =>
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						fieldValidationsSchema.parse((params as { value: unknown }).value)
				: fieldValidationsSchema,
			currentDirtyEventsCounter: 0,
			failedAttempts: 0,
			passedAttempts: 0,
			events: {
				blur: {
					failedAttempts: 0,
					passedAttempts: 0,
					isActive: params.validationEvents?.blur ?? true,
				},
				change: {
					failedAttempts: 0,
					passedAttempts: 0,
					isActive: params.validationEvents?.change ?? false,
				},
				submit: {
					failedAttempts: 0,
					passedAttempts: 0,
					isActive: params.validationEvents?.submit ?? true,
				},
			},
			currentEvent: null,
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

function createFormStoreFields<
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(
	params: CreateFormStoreProps<FieldsValues, ValidationSchema>,
	baseId: string,
	metadata: FormStoreShape<FieldsValues, ValidationSchema>['metadata'],
) {
	type FormStore = FormStoreShape<FieldsValues, ValidationSchema>;

	const fields = {} as FormStore['fields'];
	for (const fieldName of metadata.fieldsNames) {
		fields[fieldName] = new FormStoreField({
			value: params.initialValues[fieldName],
			valueFromFieldToStore: params.valuesFromFieldsToStore?.[fieldName]
				? params.valuesFromFieldsToStore[fieldName]
				: undefined,
			valueFromStoreToField: params.valuesFromStoreToFields?.[fieldName]
				? params.valuesFromStoreToFields[fieldName]
				: undefined,
			id: `${baseId}field-${String(fieldName)}`,
			metadata: {
				name: fieldName,
				initialValue: params.initialValues[fieldName],
			},
		} as (typeof fields)[typeof fieldName]);
	}

	return fields;
}

function _setFieldError<FieldsValues, ValidationSchema>(params: {
	name: keyof ValidationSchema;
	message: string | null;
	validationEvent: ValidationEvents;
}) {
	return function (
		currentState: FormStoreShape<FieldsValues, ValidationSchema>,
	): FormStoreShape<FieldsValues, ValidationSchema> {
		if (
			!currentState.validations[params.name].events[params.validationEvent]
				.isActive
		)
			return currentState;

		let currentDirtyFieldsCounter = currentState.currentDirtyFieldsCounter;
		const validation = {
			...currentState.validations[params.name],
		};
		validation.currentEvent = params.validationEvent;

		if (params.message) {
			validation.failedAttempts++;
			validation.events[params.validationEvent].failedAttempts++;

			if (!validation.isDirty) {
				validation.currentDirtyEventsCounter++;
				if (validation.currentDirtyEventsCounter > 0) {
					currentDirtyFieldsCounter++;
				}
			}

			// validation.events[params.validationEvent].error = {
			// 	message: params.message,
			// };
			validation.error = { message: params.message };
			// validation.events[params.validationEvent].isDirty = true;
			validation.isDirty = true;
		} else {
			validation.passedAttempts++;
			validation.events[params.validationEvent].passedAttempts++;

			if (validation.isDirty) {
				validation.currentDirtyEventsCounter--;
				if (validation.currentDirtyEventsCounter === 0) {
					currentDirtyFieldsCounter--;
				}
			}

			// validation.events[params.validationEvent].error = null;
			validation.error = null;
			// validation.events[params.validationEvent].isDirty = false;
			validation.isDirty = false;
		}

		currentState.currentDirtyFieldsCounter = currentDirtyFieldsCounter;
		currentState.isDirty = currentDirtyFieldsCounter > 0;
		currentState.validations = {
			...currentState.validations,
			[params.name]: validation,
		};

		return currentState;
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TFunction = (...args: any[]) => any;
type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
	Exclude<{} | null | undefined, TFunction>;
function _setFieldValue<
	FieldsValues,
	ValidationSchema,
	Name extends keyof FieldsValues,
>(
	name: Name,
	valueOrUpdater:
		| AnyValueExceptFunctions
		| ((value: FieldsValues[Name]) => FieldsValues[Name]),
) {
	return function (
		currentState: FormStoreShape<FieldsValues, ValidationSchema>,
	): FormStoreShape<FieldsValues, ValidationSchema> {
		const field = currentState.fields[name];

		field.value = (
			typeof valueOrUpdater === 'function'
				? valueOrUpdater(field.value)
				: valueOrUpdater
		) as FieldsValues[typeof name];

		return {
			...currentState,
			fields: {
				...currentState.fields,
				[name]: field,
			},
		};
	};
}

const itemsToResetDefaults = {
	fields: true,
	validations: true,
	submit: false,
	focus: true,
};

function getFormStoreBaseMethods<
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(
	set: SetStateInternal<FormStoreShape<FieldsValues, ValidationSchema>>,
	get: () => FormStoreShape<FieldsValues, ValidationSchema>,
	params: CreateFormStoreProps<FieldsValues, ValidationSchema>,
): FormStoreShapeBaseMethods<FieldsValues, ValidationSchema> {
	type FormStoreBaseMethods = FormStoreShapeBaseMethods<
		FieldsValues,
		ValidationSchema
	>;

	const getValues: FormStoreBaseMethods['getValues'] = () => {
		const currentState = get();
		const fieldsValues = {} as FieldsValues;

		let fieldName: string;
		for (fieldName in currentState.fields) {
			fieldsValues[fieldName as keyof FieldsValues] =
				currentState.fields[fieldName as keyof FieldsValues].value;
		}

		return fieldsValues;
	};
	const getValue: FormStoreBaseMethods['getValue'] = (name) => {
		const currentState = get();
		return currentState.fields[name].value;
	};
	const setSubmitState: FormStoreBaseMethods['setSubmitState'] = (
		valueOrUpdater,
	) => {
		set(function (currentState) {
			return {
				// ...currentState,
				submit: {
					...currentState.submit,
					...(typeof valueOrUpdater === 'function'
						? valueOrUpdater(currentState.submit)
						: valueOrUpdater),
				},
			};
		});
	};

	const setFocusState: FormStoreBaseMethods['setFocusState'] = (
		fieldName,
		validationName,
		isActive,
	) => {
		set(function (currentState) {
			let _currentState = currentState;

			if (
				!isActive &&
				_currentState.validations[validationName].events.blur.isActive
			) {
				try {
					_currentState.validations[validationName].handler({
						value: (validationName && fieldName !== validationName
							? _currentState.getValues()
							: _currentState.fields[fieldName].value) as never,
						name: fieldName as never,
						get,
						validationEvent: 'blur',
						..._currentState._baseMethods,
					});
					_currentState = _setFieldError<FieldsValues, ValidationSchema>({
						name: validationName,
						message: null,
						validationEvent: 'blur',
					})(_currentState);
				} catch (error) {
					const message = _currentState.errorFormatter(error, 'blur');
					_currentState = _setFieldError<FieldsValues, ValidationSchema>({
						name: validationName,
						message,
						validationEvent: 'blur',
					})(_currentState);
				}

				if (
					_currentState.focus.isActive &&
					_currentState.focus.field.name !== fieldName
				)
					return _currentState;
			}

			return {
				..._currentState,
				focus: isActive
					? {
							isActive: true,
							field: {
								name: fieldName,
								id: _currentState.fields[fieldName].id,
							},
					  }
					: { isActive: false, field: null },
			};
		});
	};

	const resetFormStore: FormStoreBaseMethods['resetFormStore'] = (
		itemsToReset = itemsToResetDefaults,
	) => {
		return set(function (currentState) {
			const fields = currentState.fields;
			const validations = currentState.validations;
			let isDirty = currentState.isDirty;
			let submit = currentState.submit;
			let focus = currentState.focus;

			if (itemsToReset.fields) {
				let fieldName: keyof typeof fields;
				for (fieldName in fields) {
					fields[fieldName].value = fields[fieldName].metadata.initialValue;
				}
			}

			if (itemsToReset.validations) {
				for (const key in validations) {
					validations[key].failedAttempts = 0;
					validations[key].passedAttempts = 0;
					validations[key].currentEvent = null;
					validations[key].isDirty = false;
					validations[key].error = null;

					let eventKey: ValidationEvents;
					for (eventKey in validations[key].events) {
						validations[key].events[eventKey].isActive = false;
						validations[key].events[eventKey].failedAttempts = 0;
						validations[key].events[eventKey].passedAttempts = 0;
						// validations[key].events[eventKey].isDirty = false;
						// validations[key].events[eventKey].error = null;
					}
				}
				isDirty = false;
			}
			if (itemsToReset.submit) {
				submit = {
					counter: 0,
					passedAttempts: 0,
					failedAttempts: 0,
					errorMessage: null,
					isActive: false,
				};
			}

			if (itemsToReset.focus) {
				focus = {
					isActive: false,
					field: null,
				};
			}

			return {
				// ...currentState,
				fields,
				validations,
				isDirty,
				submit,
				focus,
			};
		});
	};

	const setFieldValue: FormStoreBaseMethods['setFieldValue'] = (
		name,
		value,
	) => {
		return set(_setFieldValue(name, value));
	};
	const setFieldError: FormStoreBaseMethods['setFieldError'] = (params) => {
		set(_setFieldError(params));
	};
	const errorFormatter: FormStoreBaseMethods['errorFormatter'] =
		params.errorFormatter ?? defaultErrorFormatter;
	const handleInputChange: FormStoreBaseMethods['handleInputChange'] = (
		name,
		valueOrUpdater,
		validationName,
	) => {
		let currentState = get();
		const field = currentState.fields[name];

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const _value =
			typeof valueOrUpdater === 'function'
				? valueOrUpdater(field.value)
				: valueOrUpdater;
		const value = field.valueFromFieldToStore
			? field.valueFromFieldToStore(_value)
			: (_value as FieldsValues[typeof name]);

		const _validationName = (
			validationName
				? validationName
				: // eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				currentState.metadata.referencedValidatedFieldsMap[name]
				? name
				: undefined
		) as typeof validationName;

		const setFieldValue = _setFieldValue<
			FieldsValues,
			ValidationSchema,
			typeof name
		>;
		const setFieldError = _setFieldError<FieldsValues, ValidationSchema>;

		if (
			_validationName &&
			currentState.validations[_validationName].events['change'].isActive
		) {
			try {
				currentState = setFieldValue(
					name,
					currentState.validations[_validationName].handler(
						{
							value: (validationName &&
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							validationName !== name
								? currentState.getValues()
								: value) as never,
							name: name as never,
							get,
							validationEvent: 'change',
							...currentState._baseMethods,
						},
						// validationName &&
						// 	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// 	// @ts-ignore
						// 	validationName !== name
						// 	? currentState.getValues()
						// 	: value,
						// 'change',
					),
				)(currentState);

				currentState = setFieldError({
					name: _validationName,
					message: null,
					validationEvent: 'change',
				})(currentState);
			} catch (error) {
				currentState = setFieldError({
					name: _validationName,
					message: currentState.errorFormatter(error, 'change'),
					validationEvent: 'change',
				})(currentState);

				currentState = setFieldValue(name, value)(currentState);
			}
		} else {
			currentState = setFieldValue(name, value)(currentState);
		}

		set(currentState);
	};
	const getFieldEventsListeners: FormStoreBaseMethods['getFieldEventsListeners'] =
		(name, validationName) => {
			const currentState = get();
			const _validationName = validationName ?? name;
			return {
				onChange: (event: { target: { value: string } }) => {
					currentState.handleInputChange(name, event.target.value);
				},
				onFocus: () => {
					currentState.setFocusState(
						name,
						_validationName, // as keyof ValidationSchema,
						true,
					);
				},
				onBlur: () => {
					currentState.setFocusState(
						name,
						_validationName, //as keyof ValidationSchema,
						false,
					);
				},
			};
		};
	const handleSubmit: FormStoreBaseMethods['handleSubmit'] = (
		cb: HandleSubmitCB<FieldsValues, ValidationSchema>,
	) => {
		return async function (
			event: FormEvent<HTMLFormElement>,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
		): Promise<unknown> | unknown {
			event.preventDefault();

			const currentState = get();

			currentState.setSubmitState({ isActive: true });

			const metadata = currentState.metadata;
			const fields = currentState.fields;
			const validations = currentState.validations;
			const values: Record<string, unknown> = {};
			const validatedValues: Record<string, unknown> = {};

			const errors: Record<
				string,
				{
					name: string | number | symbol;
					message: string | null;
					validationEvent: ValidationEvents;
				}
			> = {};

			let hasError = false;

			let fieldName: keyof typeof fields & string;
			for (fieldName in fields) {
				values[fieldName] = fields[fieldName].value;

				try {
					const validationSchema =
						fieldName in metadata.referencedValidatedFieldsMap &&
						validations[fieldName as unknown as keyof typeof validations]
							.handler;

					if (
						typeof validationSchema !== 'function' ||
						!validations[fieldName as unknown as keyof typeof validations]
							.events.submit.isActive
					) {
						continue;
					}

					validatedValues[fieldName] = validationSchema({
						value: fields[fieldName].value as never,
						name: fieldName as never,
						get,
						validationEvent: 'submit',
						...currentState._baseMethods,
					});

					errors[fieldName] = {
						name: fieldName,
						message: null,
						validationEvent: 'submit',
					};
				} catch (error) {
					errors[fieldName] = {
						name: fieldName,
						message: currentState.errorFormatter(error, 'submit'),
						validationEvent: 'submit',
					};
				}
			}

			let manualFieldName: keyof (typeof metadata)['manualValidatedFieldsMap'];
			for (manualFieldName of metadata.manualValidatedFields) {
				try {
					const validationSchema =
						currentState.validations[manualFieldName].handler;
					if (typeof validationSchema !== 'function') {
						continue;
					}

					validatedValues[manualFieldName as string] = validationSchema(
						{
							value: undefined as never,
							name: undefined as never,
							get,
							validationEvent: 'submit',
							...currentState._baseMethods,
						},
						// values as FieldsValues,
						// 'submit',
					);

					errors[manualFieldName as string] = {
						name: manualFieldName,
						message: null,
						validationEvent: 'submit',
					};
				} catch (error) {
					errors[manualFieldName as string] = {
						name: manualFieldName,
						message: currentState.errorFormatter(error, 'submit'),
						validationEvent: 'submit',
					};
				}
			}

			type NecessaryEvil = {
				values: FieldsValues;
				validatedValues: GetValidationValuesFromSchema<ValidationSchema>;
				error: Parameters<
					typeof _setFieldError<FieldsValues, ValidationSchema> // ['utils']['setFieldError']
				>[0];
				errors: {
					[Key in keyof ValidationSchema]: {
						name: Key;
						message: string | null;
						validationEvent: ValidationEvents;
					};
				};
			};

			let _currentState: FormStoreShape<FieldsValues, ValidationSchema> = get();
			let errorKey: keyof typeof errors & string;
			for (errorKey in errors) {
				const errorObj = errors[errorKey];

				_currentState = _setFieldError<FieldsValues, ValidationSchema>(
					errors[errorKey] as unknown as NecessaryEvil['error'],
				)(_currentState);

				if (typeof errorObj.message !== 'string') continue;

				hasError = true;
			}

			if (!hasError) {
				try {
					await cb({
						event,
						values: values as NecessaryEvil['values'],
						validatedValues:
							validatedValues as NecessaryEvil['validatedValues'],
						hasError,
						errors: errors as NecessaryEvil['errors'],
					});
					currentState.setSubmitState((prev) => ({
						isActive: false,
						counter: prev.counter + 1,
						passedAttempts: prev.counter + 1,
						errorMessage: null,
					}));
				} catch (error) {
					currentState.setSubmitState((prev) => ({
						isActive: false,
						counter: prev.counter + 1,
						failedAttempts: prev.counter + 1,
						errorMessage: currentState.errorFormatter(error, 'submit'),
					}));
				}
			} else {
				set(_currentState);
				currentState.setSubmitState((prev) => ({
					isActive: false,
					counter: prev.counter + 1,
					failedAttempts: prev.counter + 1,
					errorMessage: null,
				}));
			}
		};
	};

	return {
		getValues,
		errorFormatter,
		getValue,
		setSubmitState,
		setFocusState,
		resetFormStore,
		setFieldValue,
		setFieldError,
		handleInputChange,
		getFieldEventsListeners,
		handleSubmit,
	};
}

export function createFormStoreBuilder<
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(params: CreateFormStoreProps<FieldsValues, ValidationSchema>) {
	type FormStore = FormStoreShape<FieldsValues, ValidationSchema>;

	return (
		set: SetStateInternal<FormStore>,
		get: () => FormStore,
	): FormStore => {
		const formStoreBaseMethods = getFormStoreBaseMethods(set, get, params);

		const baseId = params.baseId ? `${params.baseId}-` : '';
		const metadata = createFormStoreMetadata(params, baseId);
		const fields = createFormStoreFields(params, baseId, metadata);
		const validations = createFormStoreValidations(params, metadata);

		return {
			baseId,
			metadata,
			validations,
			fields,
			id: `${baseId}form`,
			isDirty: false,
			submit: {
				counter: 0,
				passedAttempts: 0,
				failedAttempts: 0,
				errorMessage: null,
				isActive: false,
			},
			focus: { isActive: false, field: null },
			currentDirtyFieldsCounter: 0,
			_baseMethods: formStoreBaseMethods,
			...formStoreBaseMethods,
		};
	};
}
