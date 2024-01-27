/**
 * @template Name
 * @template Value
 * @typedef ControlMetadata
 *
 * @prop {Name & string} name
 * @prop {Value} initialValue
 */

/** @exports ControlMetadata */

/**
 * @template ControlsValues
 * @template {keyof ControlsValues} Key
 */
export default class FormStoreControl {
	/** @type {string} */
	id;

	/** @type {ControlsValues[Key]} */
	value;

	/** @type {ControlMetadata<Key, ControlsValues[Key]>} */
	metadata;

	/** @type {((controlValue: unknown) => Exclude<ControlsValues[Key], (value: ControlsValues[Key]) => ControlsValues[Key]>) | undefined} */
	valueFromControlToStore;

	/** @type {(storeValue: ControlsValues[Key]) => string | ReadonlyArray<string> | number | undefined} */
	valueFromStoreToControl;

	/**
	 * @param {{
	 *   id: string;
	 *   value: ControlsValues[Key];
	 *   metadata: ControlMetadata<Key, ControlsValues[Key]>;
	 *   valueFromControlToStore?: (controlValue: unknown) => Exclude<ControlsValues[Key], (value: ControlsValues[Key]) => ControlsValues[Key]>;
	 *   valueFromStoreToControl?: (StoreValue: ControlsValues[Key]) => string | ReadonlyArray<string> | number | undefined;
	 * }} params
	 */
	constructor(params) {
		/** @type {string} */
		this.id = params.id;

		/** @type {ControlsValues[Key]} */
		this.value = params.value;

		/** @type {ControlMetadata<Key, ControlsValues[Key]>} */
		this.metadata = params.metadata;

		/** @type {boolean} */

		/** @type {(controlValue: unknown) => Exclude<ControlsValues[Key], (value: ControlsValues[Key]) => ControlsValues[Key]>} */
		this.valueFromControlToStore = params.valueFromControlToStore;

		/** @type {(StoreValue: ControlsValues[Key]) => string | ReadonlyArray<string> | number | undefined} */
		this.valueFromStoreToControl =
			params.valueFromStoreToControl ??
			/**
			 * @param {ControlsValues[Key]} StoreValue
			 * @returns string | ReadonlyArray<string> | number | undefined
			 */
			((value) => value ?? '');
	}

	/**
	 * @description Gets the control value converted _(using the passed `valueFromStoreToControl` if not it will just return the original value)_ from the store value.
	 *
	 * @type {string | ReadonlyArray<string> | number | undefined}
	 * */
	get storeToControlValue() {
		return this.valueFromStoreToControl(this.value);
	}
}
