import { createStore } from 'zustand';
import { createFormStoreBuilder } from '../..';
import { useId, useRef } from 'react';

export { useStore } from 'zustand';
export * from './types';

/**
 * @template FieldsValues
 * @template {import("../../types").ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {import("../../types").CreateFormStoreProps<FieldsValues, ValidationSchema>} params
 */
export const handleCreateFormStore = (params) =>
	createStore(createFormStoreBuilder(params));

/**
 * @template FieldsValues
 * @template {import("../../types").ValidValidationSchema<FieldsValues>} ValidationSchema
 * @param {import("../../types").CreateFormStoreProps<FieldsValues, ValidationSchema>} props
 */
export const useCreateFormStore = (props) => {
	const baseId = useId();
	const formStoreRef = useRef(
		handleCreateFormStore({ ...props, baseId: props.baseId || baseId }),
	);

	return formStoreRef.current;
};
