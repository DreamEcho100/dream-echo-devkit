import { FormStoreMetadata } from "~/utils/create-form-store-builder/metadata.js";
import { FormStoreValidations } from "~/utils/create-form-store-builder/validations.js";
import { createFormStoreControls, getFormStoreBaseMethods } from "./utils.js";

// import { createFormStoreValidations } from './validations';

/**
 * @template ControlsValues
 * @template {import('~/types/index.js').ValidValidationSchemaInput<ControlsValues>} ValidationSchema
 * @param {import('~/types/index.js').CreateFormStoreProps<ControlsValues, ValidationSchema>} params
 * @returns {(set: import('~/types/internal.js').SetStateInternal<FormStore>, get: () => FormStore) => FormStore}
 */
export default function createFormStoreBuilder(params) {
  /**
   * @typedef {import('~/types/index.js').FormStoreShape<ControlsValues, ValidationSchema>} FormStore
   */

  return (set, get) => {
    const formStoreBaseMethods = getFormStoreBaseMethods(set, get, params);

    const baseId = params.baseId ?? Math.random().toString(36).slice(2);
    const metadata = new FormStoreMetadata({
      baseId,
      initialValues: params.initialValues,
      validationSchema: params.validationSchema,
    });
    const controls = createFormStoreControls(params, baseId, metadata);
    const validations = new FormStoreValidations({
      metadata,
      validationEvents: params.validationEvents,
      validationSchema: params.validationSchema,
    });

    return {
      baseId,
      metadata,
      validations,
      controls,
      formId: `form-${baseId}`,
      isDirty: false,
      submit: {
        counter: 0,
        passedAttempts: 0,
        failedAttempts: 0,
        error: null,
        isPending: false,
      },
      focus: { isPending: false, control: null },
      dirtyControlsCounter: 0,
      ...formStoreBaseMethods,
    };
  };
}
