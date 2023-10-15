/**
 * @template Name
 * @template Value
 * @typedef FieldMetadata
 *
 * @prop {Name & string} name
 * @prop {Value} initialValue
 */

/** @exports FieldMetadata */

/**
 * @template FieldsValues
 * @template {keyof FieldsValues} Key
 */
export default class FormStoreField {
	/** @type {string} */
	id;

	/** @type {FieldsValues[Key]} */
	value;

	/** @type {FieldMetadata<Key, FieldsValues[Key]>} */
	metadata;

	/** @type {((fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>) | undefined} */
	valueFromFieldToStore;

	/** @type {(storeValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined} */
	valueFromStoreToField;

	/**
	 * @param {{
	 *   id: string;
	 *   value: FieldsValues[Key];
	 *   metadata: FieldMetadata<Key, FieldsValues[Key]>;
	 *   valueFromFieldToStore?: (fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>;
	 *   valueFromStoreToField?: (StoreValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
	 * }} params
	 */
	constructor(params) {
		/** @type {string} */
		this.id = params.id;

		/** @type {FieldsValues[Key]} */
		this.value = params.value;

		/** @type {FieldMetadata<Key, FieldsValues[Key]>} */
		this.metadata = params.metadata;

		/** @type {boolean} */

		/** @type {(fieldValue: unknown) => Exclude<FieldsValues[Key], (value: FieldsValues[Key]) => FieldsValues[Key]>} */
		this.valueFromFieldToStore = params.valueFromFieldToStore;

		/** @type {(StoreValue: FieldsValues[Key]) => string | ReadonlyArray<string> | number | undefined} */
		this.valueFromStoreToField =
			params.valueFromStoreToField ??
			/**
			 * @param {FieldsValues[Key]} StoreValue
			 * @returns string | ReadonlyArray<string> | number | undefined
			 */
			(() => this.value ?? '');
	}

	/**
	 * @description Gets the field value converted _(using the passed `valueFromStoreToField` if not it will just return the original value)_ from the store value.
	 *
	 * @type {string | ReadonlyArray<string> | number | undefined}
	 * */
	get storeToFieldValue() {
		return this.valueFromStoreToField(this.value);
	}
}
