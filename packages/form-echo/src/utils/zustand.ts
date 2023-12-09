import { createStore } from 'zustand';
import type { CreateFormStoreProps, ValidValidationSchema } from '../types';
import { createFormStoreBuilder } from '.';
import { useId, useState } from 'react';

export const handleCreateFormStore = <
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(
	params: CreateFormStoreProps<FieldsValues, ValidationSchema>,
) => createStore(createFormStoreBuilder(params));

export const useCreateFormStore = <
	FieldsValues,
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(
	props: Omit<
		CreateFormStoreProps<FieldsValues, ValidationSchema>,
		'baseId'
	> & {
		baseId?: CreateFormStoreProps<FieldsValues, ValidationSchema>['baseId'];
	},
) => {
	const baseId = useId();
	const formStore = useState(
		handleCreateFormStore({ ...props, baseId: props.baseId || baseId }),
	);

	return formStore[0];
};
