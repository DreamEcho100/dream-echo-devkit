import { isZodValidator } from "~/utils/zod.js";

/**
 * @template ControlsValues
 * @template ValidationSchema
 *
 * @description Creates validations for the form store based on the provided parameters and metadata.
 */
export class FormStoreValidations {
  /**
   * @typedef {{
   * 	[Key in keyof import("~/types/index.js").GetValidationValuesFromSchema<ValidationSchema>]: import("~/types/index.js").FormStoreValidation<
   * 		ControlsValues,
   * 		ValidationSchema,
   * 		Key
   * 	>;
   * }} ValidationsControls
   */

  /** @type {ValidationsControls} */
  items;

  /** @type {Partial<Record<keyof ValidationsControls, boolean>>} */
  dirtyControls = {};

  /** @type {{ item: keyof ValidationsControls | null; event: import("~/types/index.js").ValidationEvents | null }} */
  lastActive = { item: null, event: null };

  /** @type {boolean} */
  isDirty = false;

  /** @type {number} */
  currentDirtyControlsCounter = 0;

  /**
   * @param {Pick<import('~/types/index.js').CreateFormStoreProps<ControlsValues, ValidationSchema>, 'validationEvents' | 'validationSchema'> & { metadata: import('./metadata.js').FormStoreMetadata<ControlsValues, ValidationSchema> } } params
   */
  constructor(params) {
    /**
     * @typedef {NonNullable<typeof params['validationEvents']>} ValidationEvent2State
     **/

    /** @type {ValidationEvent2State} */
    let itemValidationEvents = {
      submit: true,
      focus: true,
    };
    let isControlHavingPassedValidations = false;
    /** @type {import('~/types/index.js').ValidationEvents} */
    let itemValidationEventKey;

    const validationsControls = /** @type {ValidationsControls} */ ({});

    if (params.validationSchema) {
      for (const itemName of params.metadata.validatedControlsNames) {
        const itemValidationsSchema =
          params.validationSchema[
            /** @type {keyof typeof params['validationSchema']} */
            (itemName)
          ];

        /** @typedef {typeof validationsControls[keyof typeof validationsControls]} validationsControl */

        validationsControls[itemName] =
          /** @satisfies {validationsControl} */
          ({
            handler: /** @type {validationsControl['handler']} */ (
              !itemValidationsSchema
                ? undefined
                : isZodValidator(itemValidationsSchema)
                  ? /** @param {unknown} params  */
                    (params) =>
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                      itemValidationsSchema.parse(
                        /** @type {{ value: unknown }} */ (params).value,
                      )
                  : itemValidationsSchema
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
              name: /** @type {validationsControl['metadata']['name']} */ (
                itemName
              ),
            },
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
            validationsControls[itemName].events[
              itemValidationEventKey
            ].isActive = !!typeof itemValidationEvents[itemValidationEventKey];
          }
        }
      }
    }

    this.items = validationsControls;
  }
}
