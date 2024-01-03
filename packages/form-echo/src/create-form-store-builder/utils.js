import FormStoreField from '../_/field';
import { errorFormatter as defaultErrorFormatter } from '../helpers/zod';

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
 * @typedef {import("../types").ValidationEvents} ValidationEvents
 */

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {CreateFormStoreProps<FieldsValues, ValidationSchema>} params - Parameters for creating form store fields.
 * @param {string} baseId - Base identifier for the form store fields.
 * @param {import('../_/metadata').FormStoreMetadata<FieldsValues, ValidationSchema>} metadata - Metadata object for the form store.
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
			!currentState.validations.fields[params.name].events[
				params.validationEvent
			].isActive
		)
			return currentState;

		let currentDirtyFieldsCounter =
			currentState.validations.currentDirtyFieldsCounter;
		const validationField = {
			...currentState.validations.fields[params.name],
		};
		validationField.currentEvent = params.validationEvent;

		if (params.error) {
			validationField.failedAttempts++;
			validationField.events[params.validationEvent].failedAttempts++;

			if (!currentState.validations.dirtyFields[params.name]) {
				validationField.currentDirtyEventsCounter++;
				if (validationField.currentDirtyEventsCounter > 0) {
					currentDirtyFieldsCounter++;
				}
			}

			currentState.validations.dirtyFields[params.name] = true;
			validationField.error = params.error;
		} else {
			validationField.passedAttempts++;
			validationField.events[params.validationEvent].passedAttempts++;

			if (currentState.validations.dirtyFields[params.name]) {
				validationField.currentDirtyEventsCounter--;
				if (validationField.currentDirtyEventsCounter === 0) {
					currentDirtyFieldsCounter--;
				}
			}

			currentState.validations.dirtyFields[params.name] = false;
			validationField.error = null;
		}

		currentState.validations.lastActive.field = params.name;
		currentState.validations.lastActive.event = params.validationEvent;
		currentState.validations.currentDirtyFieldsCounter =
			currentDirtyFieldsCounter;
		currentState.validations.isDirty = currentDirtyFieldsCounter > 0;

		currentState.validations.fields = {
			...currentState.validations.fields,
			[params.name]: validationField,
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
	 * @typedef {FormStoreBaseMethods['handleChange']} HandleInputChange
	 * @typedef {FormStoreBaseMethods['handleSubmit']} HandleSubmit
	 */

	/** @type {GetValues} */
	function getValues() {
		const currentState = get();
		const fieldsValues = /** @type {FieldsValues} */ ({});

		/** @type {string} */
		let fieldName;
		for (fieldName in currentState.fields) {
			fieldsValues[/** @type {FieldsValuesKeys} */ (fieldName)] =
				currentState.fields[/** @type {FieldsValuesKeys} */ (fieldName)].value;
		}

		return fieldsValues;
	}

	/** @type {GetValue} */
	function getValue(name) {
		const currentState = get();
		return currentState.fields[name].value;
	}

	/** @type {SetSubmitState} */
	function setSubmitState(valueOrUpdater) {
		const currentState = get();

		const submit = {
			...currentState.submit,
			...(typeof valueOrUpdater === 'function'
				? valueOrUpdater(currentState.submit)
				: valueOrUpdater),
		};
		set({ submit });
	}

	/** @type {SetFocusState} */
	function setFocusState(fieldName, validationName, type) {
		let currentState = get();

		if (currentState.validations.fields[validationName].events.focus.isActive) {
			try {
				currentState.validations.fields[validationName].handler({
					value: /** @type {never} */ (
						!validationName || fieldName === validationName
							? currentState.fields[fieldName].value
							: undefined
					),
					name: /** @type {never} */ (fieldName),
					validationEvent: 'focus',
					get,
					getValue: currentState.getValue,
					getValues: currentState.getValues,
					setError: currentState.setError,
					setSubmitState: currentState.setSubmitState,
					setFocusState: currentState.setFocusState,
					resetFormStore: currentState.resetFormStore,
					setFieldValue: currentState.setFieldValue,
				});
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setError({
					name: validationName,
					error: null,
					validationEvent: 'focus',
				})(currentState);
			} catch (error) {
				const formattedError = currentState.errorFormatter(error, 'focus');
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setError({
					name: validationName,
					error: formattedError,
					validationEvent: 'focus',
				})(currentState);
			}

			if (
				currentState.focus.isPending &&
				currentState.focus.field.name === fieldName
			)
				return set(currentState);
		}

		/** @type {typeof currentState['focus']} */
		const focus =
			type === 'in'
				? {
						isPending: true,
						field: {
							name: fieldName,
							id: currentState.fields[fieldName].id,
						},
				  }
				: { isPending: false, field: null };

		set({ focus });
	}

	/** @type {ResetFormStore} */
	function resetFormStore(itemsToReset = itemsToResetDefaults) {
		const currentState = get();
		const fields = currentState.fields;
		const validations = currentState.validations;
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
			validations.currentDirtyFieldsCounter = 0;
			validations.dirtyFields = {};
			validations.isDirty = false;
			validations.lastActive.event = null;
			validations.lastActive.field = null;

			for (const key in validations.fields) {
				validations.fields[key].failedAttempts = 0;
				validations.fields[key].passedAttempts = 0;
				validations.fields[key].currentEvent = null;
				validations.fields[key].error = null;

				/** @type {import('../types').ValidationEvents} */
				let eventKey;
				for (eventKey in validations.fields[key].events) {
					validations.fields[key].events[eventKey].isActive = false;
					validations.fields[key].events[eventKey].failedAttempts = 0;
					validations.fields[key].events[eventKey].passedAttempts = 0;
				}
			}
		}
		if (itemsToReset.submit) {
			submit = {
				counter: 0,
				passedAttempts: 0,
				failedAttempts: 0,
				error: null,
				isPending: false,
			};
		}

		if (itemsToReset.focus) {
			focus = {
				isPending: false,
				field: null,
			};
		}

		return set({ fields, validations, submit, focus });
	}

	/** @type {SetFieldValue} */
	function setFieldValue(name, value) {
		return set(_setFieldValue(name, value));
	}

	/** @type {SetFieldError} */
	function setError(params) {
		set(_setError(params));
	}

	/** @type {ErrorFormatter} */
	const errorFormatter = params.errorFormatter ?? defaultErrorFormatter;

	/** @type {HandleInputChange} */
	function handleChange(name, valueOrUpdater, validationName) {
		let currentState = get();
		const field = currentState.fields[name];

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const value = /** @type {FieldsValues[typeof name]} */ (
			typeof valueOrUpdater === 'function'
				? valueOrUpdater(field.value)
				: field.valueFromFieldToStore?.(valueOrUpdater) ?? valueOrUpdater
		);

		const _validationName = validationName
			? validationName
			: currentState.metadata.referencedValidatedFieldsMap[name]
			? name
			: undefined;

		if (
			_validationName &&
			currentState.validations.fields[_validationName].events['change'].isActive
		) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				currentState = _setFieldValue(
					name,
					currentState.validations.fields[_validationName].handler({
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
	}

	/** @type {GetFieldEventsListeners} */
	function getFieldEventsListeners(name, validationName) {
		const currentState = get();
		const _validationName = validationName ?? name;

		return {
			/** @param {{ target: { value: string } }} event */
			onChange: (event) => {
				currentState.handleChange(name, event.target.value);
			},
			onFocus: () => {
				currentState.setFocusState(name, _validationName, 'in');
			},
			onBlur: () => {
				currentState.setFocusState(name, _validationName, 'out');
			},
		};
	}

	/** @type {HandleSubmit} */
	function handleSubmit(cb) {
		return async function (event) {
			/** @type {{ preventDefault?: () => void }} */ (event).preventDefault?.();

			get().setSubmitState({ isPending: true, error: null });
			const currentState = get();
			currentState.focus = { isPending: false, field: null };
			// currentState.submit = {
			// 	...currentState.submit,
			// 	isPending: true,
			// 	error: null,
			// };

			const metadata = currentState.metadata;
			const fields = currentState.fields;
			const validations = currentState.validations.fields;
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
			for (manualFieldName of metadata.customValidatedFields) {
				try {
					const validationSchema =
						currentState.validations.fields[manualFieldName].handler;
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

			/** @type {keyof typeof errors & string} */
			let errorKey;
			for (errorKey in errors) {
				const errorObj = errors[errorKey];

				currentState.setError(errors[errorKey]); // (currentState);

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
						get,
						getValue: currentState.getValue,
						getValues: currentState.getValues,
						setError: currentState.setError,
						setSubmitState: currentState.setSubmitState,
						setFocusState: currentState.setFocusState,
						resetFormStore: currentState.resetFormStore,
						setFieldValue: currentState.setFieldValue,
					});
					currentState.setSubmitState((prev) => ({
						isPending: false,
						counter: prev.counter + 1,
						passedAttempts: prev.counter + 1,
						error: null,
					}));
				} catch (error) {
					currentState.setSubmitState((prev) => ({
						isPending: false,
						counter: prev.counter + 1,
						failedAttempts: prev.counter + 1,
						error: currentState.errorFormatter(error, 'submit'),
					}));
				}
			} else {
				currentState.setSubmitState((prev) => ({
					isPending: false,
					counter: prev.counter + 1,
					failedAttempts: prev.counter + 1,
					error: currentState.errorFormatter(
						new Error('FORM_VALIDATION_ERROR'),
						'submit',
					),
				}));
			}
		};
	}

	return {
		getValues,
		errorFormatter,
		getValue,
		setSubmitState,
		setFocusState,
		resetFormStore,
		setFieldValue,
		setError,
		handleChange,
		getFieldEventsListeners,
		handleSubmit,
	};
}
