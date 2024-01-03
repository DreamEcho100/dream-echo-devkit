import { FormStoreMetadata } from '~/_/metadata';
import { createFormStoreFields, getFormStoreBaseMethods } from './utils';
import { FormStoreValidations } from '../_/validations';
// import { createFormStoreValidations } from './validations';

/**
 * @template FieldsValues
 * @template {import('../types').ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {import('../types').CreateFormStoreProps<FieldsValues, ValidationSchema>} params
 * @returns {(set: import('../types/internal').SetStateInternal<FormStore>, get: () => FormStore) => FormStore}
 */
export default function createFormStoreBuilder(params) {
	/**
	 * @typedef {import('../types').FormStoreShape<FieldsValues, ValidationSchema>} FormStore
	 */

	return (set, get) => {
		const formStoreBaseMethods = getFormStoreBaseMethods(set, get, params);

		const baseId = params.baseId ? `${params.baseId}-` : '';
		const metadata = new FormStoreMetadata({
			baseId,
			initialValues: params.initialValues,
			validationSchema: params.validationSchema,
		});
		const fields = createFormStoreFields(params, baseId, metadata);
		const validations = new FormStoreValidations({
			metadata,
			validationEvents: params.validationEvents,
			validationSchema: params.validationSchema,
		});

		return {
			baseId,
			metadata,
			validations,
			fields,
			id: `${baseId}form`,
			isDirty: false,
			submit: {
				counter: 0,
				passedAttempts: 0,
				failedAttempts: 0,
				error: null,
				isPending: false,
			},
			focus: { isPending: false, field: null },
			currentDirtyFieldsCounter: 0,
			_baseMethods: formStoreBaseMethods,
			...formStoreBaseMethods,
		};
	};
}
