import { createStore } from 'zustand';
import { type CreateFormStoreProps } from '../types';
import { createFormStoreBuilder } from '.';
import { useId, useState } from 'react';

export const handleCreateFormStore = <FieldsValues, ValidationsHandlers>(
	params: CreateFormStoreProps<FieldsValues, ValidationsHandlers>,
) => createStore(createFormStoreBuilder(params));

export const useCreateFormStore = <FieldsValues, ValidationsHandlers>(
	props: Omit<
		CreateFormStoreProps<FieldsValues, ValidationsHandlers>,
		'baseId'
	> & {
		baseId?: CreateFormStoreProps<FieldsValues, ValidationsHandlers>['baseId'];
	},
) => {
	const baseId = useId();
	const formStore = useState(
		handleCreateFormStore({ ...props, baseId: props.baseId || baseId }),
	);

	return formStore[0];
};
