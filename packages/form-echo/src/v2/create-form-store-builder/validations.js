import { isZodValidator } from "~/utils/zod";

/**
 * // | 'mount' | 'custom'
 * @typedef {"submit" | "change" | "focus"} ValidationEvents
 */

/**
 * @typedef {{ message: string; path: (string | number)[] }[]} FormError
 */

/**
 * @template ControlsValues
 * @template Key
 * @typedef {
 * | import('zod').ZodSchema
 * |  (Key extends keyof ControlsValues
 * 			?  HandleValidation<ControlsValues, Record<string, unknown>, Key & string>
 * 			: HandleValidation<ControlsValues, Record<string, unknown>, string>
 * )} ValidValidationSchemaInputItemInput
 */
/**
 * @template ControlsValues
 * @typedef {{
 * 	[Key in keyof ControlsValues | (string & {})]?:
 * 		ValidValidationSchemaInputItemInput<ControlsValues, Key>;
 * }} ValidValidationSchemaInput
 */

/**
 * @template ControlsValues
 * @template ValidationSchema
 * @template {keyof ValidationSchema} Key
 * @typedef {(params: HandleValidationProps<ControlsValues, ValidationSchema, Key>) => ValidationSchema[Key]} HandleValidation
 */

/**
 * @typedef {"getControlValue" | "getControlsValues" | "setValidationError" | "setSubmit" | "setControlFocus" | "resetFormStore" | "setControlValue" | "errorFormatter"} HandleValidationPropsPassedMethodsKeys
 */
/**
 * @template ControlsValues
 * @template ValidationSchema
 * @template {keyof ValidationSchema} Key
 * @typedef {{
 * 	[K in HandleValidationPropsPassedMethodsKeys]: import("../types").FormStoreShapeBaseMethods<
 * 		ControlsValues,
 * 		ValidationSchema
 * 	>[K];
 * }} HandleValidationPropsPassedMethods
 *
 */

/**
 * @template ControlsValues
 * @template ValidationSchema
 * @template {keyof ValidationSchema} Key
 * @typedef {{
 * 	validationEvent: ValidationEvents;
 * 	get: () => import("../types").FormStoreShape<ControlsValues, ValidationSchema>;
 * 	value: Key extends keyof ControlsValues ? ControlsValues[Key] : never;
 * 	name: Key extends keyof ControlsValues ? Key & string : never;
 * }} HandleValidationProps
 */

/**
 * @template ControlsValues
 * @template ValidationSchema
 * @template {keyof ValidationSchema} Key
 */
class FormStoreValidationField {
  // Should always return the validated value
  /** @type {HandleValidation<ControlsValues, ValidationSchema, Key>} */
  handler;
  // A cleanup function on the utils?

  // events: {
  //   [key in ValidationEvents]: {
  //     isActive: boolean;
  //     passedAttempts: number;
  //     failedAttempts: number;
  //   };
  // };
  /** @type {number} */
  currentDirtyEventsCounter;
  /** @type {number} */
  passedAttempts;
  /** @type {number} */
  failedAttempts;
  /** @type {{ name: Key }} */
  metadata;
  /** @type {ValidationEvents | null} */
  currentEvent;
  /** @type {FormError | null} */
  error;

  /**
   * @param {{
   * 	handler:
   * 		ValidationSchema extends ValidValidationSchemaInput<ControlsValues>
   * 		? ValidationSchema
   * 		: undefined;
   * key: Key;
   * }} params
   */
  constructor(params) {
    this.handler =
      /** @type {HandleValidation<ControlsValues, ValidationSchema, Key>} */ (
        !params.handler
          ? undefined
          : isZodValidator(params.handler)
            ? /** @param {unknown} handlerParams  */
              (handlerParams) =>
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                /** @type {import("zod").ZodSchema} */ (params.handler).parse(
                  /** @type {{ value: unknown }} */ (handlerParams).value,
                )
            : params.handler
      );
    this.currentDirtyEventsCounter = 0;
    this.failedAttempts = 0;
    this.passedAttempts = 0;
    this.error = null;
    // events: {
    //   change: {
    //     failedAttempts: 0,
    //     passedAttempts: 0,
    //     isActive: params.validationEvents?.change ?? false,
    //   },
    //   focus: {
    //     failedAttempts: 0,
    //     passedAttempts: 0,
    //     isActive: params.validationEvents?.focus ?? true,
    //   },
    //   submit: {
    //     failedAttempts: 0,
    //     passedAttempts: 0,
    //     isActive: params.validationEvents?.submit ?? true,
    //   },
    // },
    this.currentEvent = null;
    this.metadata = { name: params.key };
  }
}

/**
 * @template Schema
 * @typedef {{
 *  [Key in keyof Schema]: Schema[Key] extends import("zod").ZodSchema<unknown>
 * 	? import("zod").infer<Schema[Key]>
 * 	: Schema[Key] extends import("~/types/internal").TFunction
 * 	? ReturnType<Schema[Key]>
 * 	: Schema[Key];
 * }} GetValidationValuesFromSchema
 */
/**
 * @template ControlsValues
 * @template ValidationSchema
 *
 * @description Creates validations for the form store based on the provided parameters and metadata.
 */
export class FormStoreValidations {
  /**
   * @typedef {{
   * 	[Key in keyof GetValidationValuesFromSchema<ValidationSchema>]: FormStoreValidationField<
   * 		ControlsValues,
   * 		ValidationSchema,
   * 		Key
   * 	>;
   * }} ValidationsSchema
   */

  /** @type {ValidationsSchema} */
  schema;

  /** @type {Partial<Record<keyof ValidationsSchema, boolean>>} */
  dirtyControls = {};

  /** @type {{ item: keyof ValidationsSchema | null; event: import("~/types").ValidationEvents | null }} */
  lastActive = { item: null, event: null };

  /** @type {boolean} */
  isDirty = false;

  /** @type {number} */
  currentDirtyControlsCounter = 0;

  /** @param {Pick<import('~/types').CreateFormStoreProps<ControlsValues, ValidationSchema>, 'validationEvents' | 'validationSchema'> & { metadata: import('./metadata').FormStoreMetadata<ControlsValues, ValidationSchema> } } params */
  constructor(params) {
    /** @typedef {NonNullable<typeof params['validationEvents']>} ValidationEvent2State **/

    /** @type {ValidationEvent2State} */
    let itemValidationEvents = {
      submit: true,
      focus: true,
    };
    let isControlHavingPassedValidations = false;
    /** @type {import('~/types').ValidationEvents} */
    let itemValidationEventKey;

    const fields = /** @type {ValidationsSchema} */ ({});

    if (params.validationSchema) {
      /** @type {keyof typeof params['metadata']['validatedControlsNames']} */
      let key;
      for (key of params.metadata.validatedControlsNames) {
        const itemValidationsSchema =
          params.validationSchema[
            /** @type {keyof typeof params['validationSchema']} */
            (key)
          ];

        /** @typedef {typeof fields[keyof typeof fields]} validationsControl */

        fields[key] = new FormStoreValidationField({
          handler: itemValidationsSchema,
          key,
        });

        if (params.validationEvents) {
          isControlHavingPassedValidations = true;
          itemValidationEvents = {
            ...itemValidationEvents,
            ...params.validationEvents,
          };
        }

        if (isControlHavingPassedValidations) {
          for (itemValidationEventKey in itemValidationEvents) {
            fields[key].events[itemValidationEventKey].isActive =
              !!typeof itemValidationEvents[itemValidationEventKey];
          }
        }
      }
    }

    this.schema = fields;
  }
}
