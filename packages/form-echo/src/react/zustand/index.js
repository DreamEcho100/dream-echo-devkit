import { createStore } from 'zustand';
import { useId, useRef } from 'react';
import createFormStoreBuilder from '~/create-form-store-builder';

export { useStore } from 'zustand';
export * from './types';

/**
 * @template FieldsValues
 * @typedef {import("../../types").ValidValidationSchema<FieldsValues>} ValidValidationSchema
 */

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @typedef {import("../../types").CreateFormStoreProps<FieldsValues, ValidationSchema>} CreateFormStoreProps
 */

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {CreateFormStoreProps<FieldsValues, ValidationSchema>} params
 */
export const handleCreateFormStore = (params) =>
	createStore(createFormStoreBuilder(params));

/**
 * @template FieldsValues
 * @template {ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {CreateFormStoreProps<FieldsValues, ValidationSchema>} props
 */
export const useCreateFormStore = (props) => {
	const baseId = useId();
	const formStoreRef = useRef(
		handleCreateFormStore({ ...props, baseId: props.baseId ?? baseId }),
	);

	return formStoreRef.current;
};
