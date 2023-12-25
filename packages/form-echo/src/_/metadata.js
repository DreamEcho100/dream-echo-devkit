/**
 * @template FieldsValues
 * @template ValidationSchema
 * @description Creates metadata for the form store based on the provided parameters.
 */
export class FormStoreMetadata {
	/**
	 * @typedef {import("../types").FormStoreShape<FieldsValues, ValidationSchema>} FormStore
	 * @typedef {FormStore['metadata']} Metadata
	 * @typedef {Metadata['fieldsNames']} FieldNames
	 * @typedef {Metadata['referencedValidatedFields']} ReferencedValidatedFields
	 * @typedef {ReferencedValidatedFields[number]} ReferencedValidatedFieldsItem
	 * @typedef {Metadata['manualValidatedFields']} ManualValidatedFields
	 * @typedef {ManualValidatedFields[number]} ManualValidatedFieldsItem
	 */

	/** @type {string} */
	baseId;
	/** @type {string} */
	formId;

	/** @type {(keyof FieldsValues)[]} */
	fieldsNames = [];
	/** @type {Record<keyof FieldsValues, true>} */
	fieldsNamesMap;

	/** @type {Record<keyof ValidationSchema, true>} */
	validatedFieldsNamesMap;
	/** @type {(keyof ValidationSchema)[]} */
	validatedFieldsNames = [];

	/** @type {Exclude<keyof ValidationSchema, keyof FieldsValues>[]} */
	manualValidatedFields = [];
	/** @type {Record<Exclude<keyof ValidationSchema, keyof FieldsValues>,true>} */
	manualValidatedFieldsMap;

	/** @type {(keyof ValidationSchema & keyof FieldsValues)[]} */
	referencedValidatedFields = [];
	/** @type {Record< keyof ValidationSchema & keyof FieldsValues, true >} */
	referencedValidatedFieldsMap;

	/**
	 * @param {Pick<import("../types").CreateFormStoreProps<FieldsValues, ValidationSchema>, 'initialValues' | 'validationSchema'> & { baseId: string }} params - Parameters for creating form store metadata.
	 */
	constructor(params) {
		if (!params.initialValues || typeof params.initialValues !== 'object')
			throw new Error('No initial values provided');

		this.baseId = params.baseId;
		this.formId = `${params.baseId}-form`;

		this.fieldsNamesMap = /** @type {Metadata['fieldsNamesMap']} */ ({});
		this.validatedFieldsNamesMap =
			/** @type {Metadata['validatedFieldsNamesMap']} */ ({});
		this.manualValidatedFieldsMap =
			/** @type {Metadata['manualValidatedFieldsMap']} */ ({});
		this.referencedValidatedFieldsMap =
			/** @type {Metadata['referencedValidatedFieldsMap']} */ ({});

		this.fieldsNames = /** @type {FieldNames} */ (
			Object.keys(params.initialValues)
		);
		for (const fieldName of this.fieldsNames) {
			this.fieldsNamesMap[fieldName] = true;
		}

		if (params.validationSchema) {
			for (const key in params.validationSchema) {
				/** @type {string[]} */
				(this.validatedFieldsNames).push(key);

				/** @type {Record<string, true>} */
				(this.validatedFieldsNamesMap)[key] = true;

				if (key in this.fieldsNamesMap) {
					/** @type {string[]} */
					(this.referencedValidatedFields).push(key);

					/** @type {Record<string, true>} */
					(this.referencedValidatedFieldsMap)[key] = true;
					continue;
				}

				/** @type {string[]} */
				(this.manualValidatedFields).push(key);

				/** @type {Record<string, true>} */
				(this.manualValidatedFieldsMap)[key] = true;
			}
		}
	}
}
