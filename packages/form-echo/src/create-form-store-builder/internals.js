import { isZodValidator } from '../zod';
import FormStoreField from '../form-store-field';
import { errorFormatter as defaultErrorFormatter } from '../zod';

/**
 * @template FieldsValues
 * @typedef {import("../types").ValidValidationSchema<FieldsValues>} ValidValidationSchema
 */

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @typedef {import("../types").CreateFormStoreProps<FieldsValues, ValidationSchema>} CreateFormStoreProps
 */
/**
 * @template FieldsValues, ValidationSchema
 * @typedef {import("../types").FormStoreShape<FieldsValues, ValidationSchema>} FormStoreShape
 */
/**
 * @template FieldsValues, ValidationSchema
 * @typedef {import("../types").FormStoreMetadata<FieldsValues, ValidationSchema>} FormStoreMetadata
 */
/**
 * @typedef {import("../types").ValidationEvents} ValidationEvents
 */

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {CreateFormStoreProps<FieldsValues, ValidationSchema>} params - Parameters for creating form store metadata.
 * @param {string} baseId - Base identifier for the form store metadata.
 *
 * @description Creates metadata for the form store based on the provided parameters.
 */
export function createFormStoreMetadata(params, baseId) {
	/**
	 * @typedef {FormStoreShape<FieldsValues, ValidationSchema>} FormStore
	 * @typedef {FormStore['metadata']} Metadata
	 * @typedef {Metadata['fieldsNames']} FieldNames
	 * @typedef {Metadata['referencedValidatedFields']} ReferencedValidatedFields
	 * @typedef {ReferencedValidatedFields[number]} ReferencedValidatedFieldsItem
	 * @typedef {Metadata['manualValidatedFields']} ManualValidatedFields
	 * @typedef {ManualValidatedFields[number]} ManualValidatedFieldsItem
	 */

	if (!params.initialValues || typeof params.initialValues !== 'object')
		throw new Error('No initial values provided');

	const metadata = /** @type {Metadata} */ (
		/** @type {unknown} */
		({
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
			// // //
			referencedValidatedFields: [],
			referencedValidatedFieldsMap: [],
		})
	);

	metadata.fieldsNames = /** @type {FieldNames} */ (
		Object.keys(params.initialValues)
	);
	for (const fieldName of metadata.fieldsNames) {
		metadata.fieldsNamesMap[fieldName] = true;
	}

	if (params.validationSchema) {
		for (const key in params.validationSchema) {
			metadata.validatedFieldsNames.push(key);

			metadata.validatedFieldsNamesMap[key] = true;

			if (key in metadata.fieldsNamesMap) {
				/** @type {string[]} */
				(metadata.referencedValidatedFields).push(key);

				/** @type {Record<string, true>} */
				(metadata.referencedValidatedFieldsMap)[key] = true;
				continue;
			}

			/** @type {string[]} */
			(metadata.manualValidatedFields).push(key);

			/** @type {Record<string, true>} */
			(metadata.manualValidatedFieldsMap)[key] = true;
		}
	}

	return metadata;
}

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {CreateFormStoreProps<FieldsValues, ValidationSchema>} params - Parameters for creating form store validations.
 * @param {FormStoreMetadata<FieldsValues, ValidationSchema>} metadata - Metadata object for the form store.
 *
 * @description Creates validations for the form store based on the provided parameters and metadata.
 */
export function createFormStoreValidations(params, metadata) {
	/**
	 * @typedef {FormStoreShape<FieldsValues, ValidationSchema>} FormStore
	 * @typedef {FormStore['validations']} Validations
	 * @typedef {NonNullable<typeof params.validationEvents>} ValidationEvent2State
	 **/

	/** @type {ValidationEvent2State} */
	let fieldValidationEvents = {
		submit: true,
		focus: true,
	};
	let isFieldHavingPassedValidations = false;
	/** @type {ValidationEvents} */
	let fieldValidationEventKey;

	const validations = /** @type {Validations} */ ({});

	if (!params.validationSchema) return validations;

	for (const fieldName of metadata.validatedFieldsNames) {
		const fieldValidationsSchema =
			params.validationSchema[
				/** @type {keyof typeof params['validationSchema']} */
				(fieldName)
			];

		validations[fieldName] =
			/** @type {NonNullable<FormStore['validations'][keyof FormStore['validations']]>} */
			({
				handler: !fieldValidationsSchema
					? undefined
					: isZodValidator(fieldValidationsSchema)
					? /** @param {unknown} params  */
					  (params) =>
							// eslint-disable-next-line @typescript-eslint/no-unsafe-return
							fieldValidationsSchema.parse(
								/** @type {{ value: unknown }} */ (params).value,
							)
					: fieldValidationsSchema,
				currentDirtyEventsCounter: 0,
				failedAttempts: 0,
				passedAttempts: 0,
				events: {
					change: {
						failedAttempts: 0,
						passedAttempts: 0,
						isActive: params.validationEvents?.change ?? false,
					},
					focus: {
						failedAttempts: 0,
						passedAttempts: 0,
						isActive: params.validationEvents?.focus ?? true,
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
			});

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

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {CreateFormStoreProps<FieldsValues, ValidationSchema>} params - Parameters for creating form store fields.
 * @param {string} baseId - Base identifier for the form store fields.
 * @param {FormStoreMetadata<FieldsValues, ValidationSchema>} metadata - Metadata object for the form store.
 *
 * @description Creates fields for the form store based on the provided parameters and metadata.
 */
export function createFormStoreFields(params, baseId, metadata) {
	/**
	 * @typedef {FormStoreShape<FieldsValues, ValidationSchema>} FormStore
	 * @typedef {FormStore['fields']} Fields
	 * @typedef {FormStore['fields'][keyof Fields]} Field
	 **/

	const fields = /** @type {Fields} */ ({});

	for (const fieldName of metadata.fieldsNames) {
		fields[fieldName] = new FormStoreField(
			/** @type {Field} */
			({
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
			}),
		);
	}

	return fields;
}

const itemsToResetDefaults = {
	fields: true,
	validations: true,
	submit: false,
	focus: true,
};

/**
 * @template FieldsValues
 * @template ValidationSchema
 * @param {import('../types/internal').FormErrorShape<keyof ValidationSchema>} params
 * @returns {(currentStat: import('../types').FormStoreShape<FieldsValues, ValidationSchema>) => import('../types').FormStoreShape<FieldsValues, ValidationSchema>}
 */
function _setError(params) {
	return function (currentState) {
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

		if (params.error) {
			validation.failedAttempts++;
			validation.events[params.validationEvent].failedAttempts++;

			if (!validation.isDirty) {
				validation.currentDirtyEventsCounter++;
				if (validation.currentDirtyEventsCounter > 0) {
					currentDirtyFieldsCounter++;
				}
			}

			validation.isDirty = true;
			validation.error = params.error;
		} else {
			validation.passedAttempts++;
			validation.events[params.validationEvent].passedAttempts++;

			if (validation.isDirty) {
				validation.currentDirtyEventsCounter--;
				if (validation.currentDirtyEventsCounter === 0) {
					currentDirtyFieldsCounter--;
				}
			}

			validation.isDirty = false;
			validation.error = null;
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

/**
 * @template FieldsValues
 * @template ValidationSchema
 * @template {keyof FieldsValues} Name
 * @param {Name} name
 * @param {import('../types/internal').AnyValueExceptFunctions | ((value: FieldsValues[Name]) => FieldsValues[Name])} valueOrUpdater
 * @returns {(currentStat: import('../types').FormStoreShape<FieldsValues, ValidationSchema>) => import('../types').FormStoreShape<FieldsValues, ValidationSchema>}
 */
function _setFieldValue(name, valueOrUpdater) {
	return function (currentState) {
		const field = currentState.fields[name];

		// FieldsValues[typeof name]

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		field.value =
			typeof valueOrUpdater === 'function'
				? valueOrUpdater(field.value)
				: valueOrUpdater;

		return {
			...currentState,
			fields: {
				...currentState.fields,
				[name]: field,
			},
		};
	};
}

// * @returns {import('./types').FormStoreShapeBaseMethods<FieldsValues, ValidationSchema>}
/**
 * @template FieldsValues
 * @template {import('../types').ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {import('../types/internal').SetStateInternal<import('../types').FormStoreShape<FieldsValues, ValidationSchema>>} set
 * @param {() => import('../types').FormStoreShape<FieldsValues, ValidationSchema>} get
 * @param {import('../types').CreateFormStoreProps<FieldsValues, ValidationSchema>} params
 */
export function getFormStoreBaseMethods(set, get, params) {
	/**
	 * @typedef {import('../types').FormStoreShapeBaseMethods<FieldsValues, ValidationSchema>} FormStoreBaseMethods
	 * @typedef {FormStoreBaseMethods['getValues']} GetValues
	 * @typedef {FormStoreBaseMethods['getValue']} GetValue
	 * @typedef {keyof FieldsValues} FieldsValuesKeys
	 * @typedef {FormStoreBaseMethods['setSubmitState']} SetSubmitState
	 * @typedef {FormStoreBaseMethods['setFocusState']} SetFocusState
	 * @typedef {FormStoreBaseMethods['resetFormStore']} ResetFormStore
	 * @typedef {FormStoreBaseMethods['setFieldValue']} SetFieldValue
	 * @typedef {FormStoreBaseMethods['setError']} SetFieldError
	 * @typedef {FormStoreBaseMethods['errorFormatter']} ErrorFormatter
	 * @typedef {FormStoreBaseMethods['getFieldEventsListeners']} GetFieldEventsListeners
	 * @typedef {FormStoreBaseMethods['handleInputChange']} HandleInputChange
	 * @typedef {FormStoreBaseMethods['handleSubmit']} HandleSubmit
	 */

	/** @type {GetValues} */
	const getValues = () => {
		const currentState = get();
		const fieldsValues = /** @type {FieldsValues} */ ({});

		/** @type {string} */
		let fieldName;
		for (fieldName in currentState.fields) {
			fieldsValues[/** @type {FieldsValuesKeys} */ (fieldName)] =
				currentState.fields[/** @type {FieldsValuesKeys} */ (fieldName)].value;
		}

		return fieldsValues;
	};

	/** @type {GetValue} */
	function getValue(name) {
		const currentState = get();
		return currentState.fields[name].value;
	}

	/** @type {SetSubmitState} */
	const setSubmitState = (valueOrUpdater) => {
		set(function (currentState) {
			return {
				submit: {
					...currentState.submit,
					...(typeof valueOrUpdater === 'function'
						? valueOrUpdater(currentState.submit)
						: valueOrUpdater),
				},
			};
		});
	};

	/** @type {SetFocusState} */
	const setFocusState = (fieldName, validationName, type) => {
		set(function (currentState) {
			let _currentState = currentState;

			if (_currentState.validations[validationName].events.focus.isActive) {
				try {
					_currentState.validations[validationName].handler({
						value: /** @type {never} */ (
							!validationName || fieldName === validationName
								? _currentState.fields[fieldName].value
								: undefined
						),
						name: /** @type {never} */ (fieldName),
						validationEvent: 'focus',
						get,
						getValue: _currentState.getValue,
						getValues: _currentState.getValues,
						setError: _currentState.setError,
						setSubmitState: _currentState.setSubmitState,
						setFocusState: _currentState.setFocusState,
						resetFormStore: _currentState.resetFormStore,
						setFieldValue: _currentState.setFieldValue,
					});
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					_currentState = _setError({
						name: validationName,
						error: null,
						validationEvent: 'focus',
					})(_currentState);
				} catch (error) {
					const formattedError = _currentState.errorFormatter(error, 'focus');
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					_currentState = _setError({
						name: validationName,
						error: formattedError,
						validationEvent: 'focus',
					})(_currentState);
				}

				if (
					_currentState.focus.isActive &&
					_currentState.focus.field.name === fieldName
				)
					return _currentState;
			}

			return {
				focus:
					type === 'in'
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

	/** @type {ResetFormStore} */
	const resetFormStore = (itemsToReset = itemsToResetDefaults) => {
		return set(function (currentState) {
			const fields = currentState.fields;
			const validations = currentState.validations;
			let isDirty = currentState.isDirty;
			let submit = currentState.submit;
			let focus = currentState.focus;

			if (itemsToReset.fields) {
				/** @type {keyof typeof fields} */
				let fieldName;
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

					/** @type {import('../types').ValidationEvents} */
					let eventKey;
					for (eventKey in validations[key].events) {
						validations[key].events[eventKey].isActive = false;
						validations[key].events[eventKey].failedAttempts = 0;
						validations[key].events[eventKey].passedAttempts = 0;
					}
				}
				isDirty = false;
			}
			if (itemsToReset.submit) {
				submit = {
					counter: 0,
					passedAttempts: 0,
					failedAttempts: 0,
					error: null,
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
				fields,
				validations,
				isDirty,
				submit,
				focus,
			};
		});
	};

	/** @type {SetFieldValue} */
	const setFieldValue = (name, value) => {
		return set(_setFieldValue(name, value));
	};
	/** @type {SetFieldError} */
	const setError = (params) => {
		set(_setError(params));
	};
	/** @type {ErrorFormatter} */
	const errorFormatter = params.errorFormatter ?? defaultErrorFormatter;
	/** @type {HandleInputChange} */
	const handleInputChange = (name, valueOrUpdater, validationName) => {
		let currentState = get();
		const field = currentState.fields[name];

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const _value =
			typeof valueOrUpdater === 'function'
				? valueOrUpdater(field.value)
				: valueOrUpdater;

		const value = field.valueFromFieldToStore
			? field.valueFromFieldToStore(_value)
			: /** @type {FieldsValues[typeof name]} */ (_value);

		const _validationName = validationName
			? validationName
			: currentState.metadata.referencedValidatedFieldsMap[name]
			? name
			: undefined; // typeof validationName

		if (
			_validationName &&
			currentState.validations[_validationName].events['change'].isActive
		) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setFieldValue(
					name,
					currentState.validations[_validationName].handler({
						value: /** @type {never} */ (
							validationName &&
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							validationName !== name
								? currentState.getValues()
								: value
						),
						name: /** @type {never} */ (name),
						get,
						validationEvent: 'change',
						getValue: currentState.getValue,
						getValues: currentState.getValues,
						setError: currentState.setError,
						setSubmitState: currentState.setSubmitState,
						setFocusState: currentState.setFocusState,
						resetFormStore: currentState.resetFormStore,
						setFieldValue: currentState.setFieldValue,
					}),
				)(currentState);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setError({
					name: /** @type {keyof ValidationSchema} */ (_validationName),
					error: null,
					validationEvent: 'change',
				})(currentState);
			} catch (error) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setError({
					name: /** @type {keyof ValidationSchema} */ (_validationName),
					error: currentState.errorFormatter(error, 'change'),
					validationEvent: 'change',
				})(currentState);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setFieldValue(name, value)(currentState);
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			currentState = _setFieldValue(name, value)(currentState);
		}

		set(currentState);
	};

	/** @type {GetFieldEventsListeners} */
	const getFieldEventsListeners = (name, validationName) => {
		const currentState = get();
		const _validationName = validationName ?? name;

		return {
			/** @param {{ target: { value: string } }} event */
			onChange: (event) => {
				currentState.handleInputChange(name, event.target.value);
			},
			onFocus: () => {
				currentState.setFocusState(name, _validationName, 'in');
			},
			onBlur: () => {
				currentState.setFocusState(name, _validationName, 'out');
			},
		};
	};

	/** @type {HandleSubmit} */
	const handleSubmit = (cb) => {
		return async function (event) {
			/** @type {{ preventDefault: () => void }} */ (event).preventDefault();

			const currentState = get();

			currentState.setSubmitState({ isActive: true });

			const metadata = currentState.metadata;
			const fields = currentState.fields;
			const validations = currentState.validations;
			/** @type {Record<string, unknown> } */
			const values = {};
			/** @type {Record<string, unknown> } */
			const validatedValues = {};

			/** @type {Record<string, import('../types/internal').FormErrorShape<keyof ValidationSchema>> } */
			const errors = {};

			let hasError = false;

			/** @type {keyof typeof fields & string} */
			let fieldName;
			for (fieldName in fields) {
				values[fieldName] = fields[fieldName].value;

				try {
					const validationSchema =
						fieldName in metadata.referencedValidatedFieldsMap &&
						validations[fieldName].handler;

					if (
						typeof validationSchema !== 'function' ||
						!validations[fieldName].events.submit.isActive
					) {
						continue;
					}

					validatedValues[fieldName] = validationSchema({
						value: /** @type {never} */ (fields[fieldName].value),
						name: fieldName,
						get,
						validationEvent: 'submit',
						...currentState,
					});

					errors[fieldName] = {
						name: fieldName,
						error: null,
						validationEvent: 'submit',
					};
				} catch (error) {
					errors[fieldName] = {
						name: fieldName,
						error: currentState.errorFormatter(error, 'submit'),
						validationEvent: 'submit',
					};
				}
			}

			/** @type {keyof (typeof metadata)['manualValidatedFieldsMap'] } */
			let manualFieldName;
			for (manualFieldName of metadata.manualValidatedFields) {
				try {
					const validationSchema =
						currentState.validations[manualFieldName].handler;
					if (typeof validationSchema !== 'function') {
						continue;
					}

					validatedValues[/** @type {string} */ (manualFieldName)] =
						validationSchema({
							value: /** @type {never} */ (undefined),
							name: /** @type {never} */ (undefined),
							get,
							validationEvent: 'submit',
							...currentState,
						});

					errors[/** @type {string} */ (manualFieldName)] = {
						name: manualFieldName,
						error: null,
						validationEvent: 'submit',
					};
				} catch (error) {
					errors[/** @type {string} */ (manualFieldName)] = {
						name: manualFieldName,
						error: currentState.errorFormatter(error, 'submit'),
						validationEvent: 'submit',
					};
				}
			}

			/**
			 * @description Necessary Evil
			 * @typedef {FieldsValues} Values
			 * @typedef {import('../types').GetValidationValuesFromSchema<ValidationSchema>} ValidatedValues
			 * @typedef {{ [Key in keyof ValidationSchema]: import('../types/internal').FormErrorShape<Key> }} Error
			 * @typedef {{ [Key in keyof ValidationSchema]: { name: Key; message: string | null; validationEvent: import('../types').ValidationEvents; }; }} Errors
			 */

			let _currentState = get();
			/** @type {keyof typeof errors & string} */
			let errorKey;
			for (errorKey in errors) {
				const errorObj = errors[errorKey];

				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				_currentState = _setError(errors[errorKey])(_currentState);

				if (!errorObj.error) continue;

				hasError = true;
			}

			if (!hasError) {
				try {
					await cb({
						event,
						values:
							/** @type {Values} */
							(values),
						validatedValues:
							/** @type {ValidatedValues} */
							(validatedValues),
						hasError,
						errors:
							/** @type {Errors} */
							(/** @type {unknown} */ (errors)),
					});
					currentState.setSubmitState((prev) => ({
						isActive: false,
						counter: prev.counter + 1,
						passedAttempts: prev.counter + 1,
						error: null,
					}));
				} catch (error) {
					currentState.setSubmitState((prev) => ({
						isActive: false,
						counter: prev.counter + 1,
						failedAttempts: prev.counter + 1,
						error: currentState.errorFormatter(error, 'submit'),
					}));
				}
			} else {
				set(_currentState);
				currentState.setSubmitState((prev) => ({
					isActive: false,
					counter: prev.counter + 1,
					failedAttempts: prev.counter + 1,
					error: null,
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
		setError,
		handleInputChange,
		getFieldEventsListeners,
		handleSubmit,
	};
}
