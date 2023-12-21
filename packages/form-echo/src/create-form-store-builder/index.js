import {
	createFormStoreMetadata,
	createFormStoreValidations,
	createFormStoreFields,
	getFormStoreBaseMethods,
} from './internals';

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
		const metadata = createFormStoreMetadata(params, baseId);
		const fields = createFormStoreFields(params, baseId, metadata);
		const validations = createFormStoreValidations(params, metadata);

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
				isActive: false,
			},
			focus: { isActive: false, field: null },
			currentDirtyFieldsCounter: 0,
			_baseMethods: formStoreBaseMethods,
			...formStoreBaseMethods,
		};
	};
}
