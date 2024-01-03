import { isZodValidator } from '~/helpers';

/**
 * @template FieldsValues
 * @template ValidationSchema
 *
 * @description Creates validations for the form store based on the provided parameters and metadata.
 */
export class FormStoreValidations {
	/**
	 * @typedef {{
	 * 	[Key in keyof import('..').GetValidationValuesFromSchema<ValidationSchema>]: import('..').FormStoreValidation<
	 * 		FieldsValues,
	 * 		ValidationSchema,
	 * 		Key
	 * 	>;
	 * }} ValidationsFields
	 */

	/** @type {ValidationsFields} */
	fields;

	/** @type {Partial<Record<keyof ValidationsFields, boolean>>} */
	dirtyFields = {};

	/** @type {{ field: keyof ValidationsFields | null; event: import('~/create-form-store-builder/utils').ValidationEvents | null }} */
	lastActive = { field: null, event: null };

	/** @type {boolean} */
	isDirty = false;

	/** @type {number} */
	currentDirtyFieldsCounter = 0;

	/**
	 * @param {Pick<import('../types').CreateFormStoreProps<FieldsValues, ValidationSchema>, 'validationEvents' | 'validationSchema'> & { metadata: import('./metadata').FormStoreMetadata<FieldsValues, ValidationSchema> } } params
	 */
	constructor(params) {
		/**
		 * @typedef {NonNullable<typeof params['validationEvents']>} ValidationEvent2State
		 **/

		/** @type {ValidationEvent2State} */
		let fieldValidationEvents = {
			submit: true,
			focus: true,
		};
		let isFieldHavingPassedValidations = false;
		/** @type {import('../types').ValidationEvents} */
		let fieldValidationEventKey;

		const validationsFields = /** @type {ValidationsFields} */ ({});

		if (params.validationSchema) {
			for (const fieldName of params.metadata.validatedFieldsNames) {
				const fieldValidationsSchema =
					params.validationSchema[
						/** @type {keyof typeof params['validationSchema']} */
						(fieldName)
					];

				/** @typedef {typeof validationsFields[keyof typeof validationsFields]} validationsField */

				validationsFields[fieldName] =
					/** @satisfies {validationsField} */
					({
						handler: /** @type {validationsField['handler']} */ (
							!fieldValidationsSchema
								? undefined
								: isZodValidator(fieldValidationsSchema)
								? /** @param {unknown} params  */
								  (params) =>
										// eslint-disable-next-line @typescript-eslint/no-unsafe-return
										fieldValidationsSchema.parse(
											/** @type {{ value: unknown }} */ (params).value,
										)
								: fieldValidationsSchema
						),
						currentDirtyEventsCounter: 0,
						failedAttempts: 0,
						passedAttempts: 0,
						error: null,
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
						metadata: {
							name: /** @type {validationsField['metadata']['name']} */ (
								fieldName
							),
						},
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
						validationsFields[fieldName].events[
							fieldValidationEventKey
						].isActive =
							!!typeof fieldValidationEvents[fieldValidationEventKey];
					}
				}
			}
		}

		this.fields = validationsFields;
	}
}
