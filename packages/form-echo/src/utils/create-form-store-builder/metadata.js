/**
 * @template ControlsValues
 * @template ValidationSchema
 * @description Creates metadata for the form store based on the provided parameters.
 */
export class FormStoreMetadata {
  /**
   * @typedef {import("~/types").FormStoreShape<ControlsValues, ValidationSchema>} FormStore
   * @typedef {FormStore['metadata']} Metadata
   * @typedef {Metadata['controlsNames']} ControlNames
   * @typedef {Metadata['directlyValidatedControls']} ReferencedValidatedControls
   * @typedef {ReferencedValidatedControls[number]} ReferencedValidatedControlsItem
   * @typedef {Metadata['customValidatedControls']} ManualValidatedControls
   * @typedef {ManualValidatedControls[number]} ManualValidatedControlsItem
   */

  /** @type {ControlsValues} */
  initialValues;

  /** @type {string} */
  baseId;
  /** @type {string} */
  formId;

  /** @type {(keyof ControlsValues)[]} */
  controlsNames = [];
  /** @type {Record<keyof ControlsValues, true>} */
  controlsNamesMap;

  /** @type {Record<keyof ValidationSchema, true>} */
  validatedControlsNamesMap;
  /** @type {(keyof ValidationSchema)[]} */
  validatedControlsNames = [];

  /** @type {Exclude<keyof ValidationSchema, keyof ControlsValues>[]} */
  customValidatedControls = [];
  /** @type {Record<Exclude<keyof ValidationSchema, keyof ControlsValues>,true>} */
  manualValidatedControlsMap;

  /** @type {(keyof ValidationSchema & keyof ControlsValues)[]} */
  directlyValidatedControls = [];
  /** @type {Record< keyof ValidationSchema & keyof ControlsValues, true >} */
  referencedValidatedControlsMap;

  /**
   * @param {Pick<import("~/types").CreateFormStoreProps<ControlsValues, ValidationSchema>, 'initialValues' | 'validationSchema'> & { baseId: string }} params - Parameters for creating form store metadata.
   */
  constructor(params) {
    if (!params.initialValues || typeof params.initialValues !== "object")
      throw new Error("No initial values provided");

    this.initialValues = params.initialValues;
    this.baseId = params.baseId;
    this.formId = `${params.baseId}-form`;

    this.controlsNamesMap = /** @type {Metadata['controlsNamesMap']} */ ({});
    this.validatedControlsNamesMap =
      /** @type {Metadata['validatedControlsNamesMap']} */ ({});
    this.manualValidatedControlsMap =
      /** @type {Metadata['manualValidatedControlsMap']} */ ({});
    this.referencedValidatedControlsMap =
      /** @type {Metadata['referencedValidatedControlsMap']} */ ({});

    this.controlsNames = /** @type {ControlNames} */ (
      Object.keys(params.initialValues)
    );

    /** @type {keyof ControlsValues} */
    let controlName;
    for (controlName of this.controlsNames) {
      this.controlsNamesMap[controlName] = true;
    }

    if (params.inputValidationSchema) {
      /** @type {string} */
      let key;
      for (key in params.inputValidationSchema) {
        /** @type {string[]} */
        (this.validatedControlsNames).push(key);

        /** @type {Record<string, true>} */
        (this.validatedControlsNamesMap)[key] = true;

        if (key in this.controlsNamesMap) {
          /** @type {string[]} */
          (this.directlyValidatedControls).push(key);

          /** @type {Record<string, true>} */
          (this.referencedValidatedControlsMap)[key] = true;
          continue;
        }

        /** @type {string[]} */
        (this.customValidatedControls).push(key);

        /** @type {Record<string, true>} */
        (this.manualValidatedControlsMap)[key] = true;
      }
    }
  }
}
