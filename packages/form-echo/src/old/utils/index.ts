export { default as inputDateHelpers } from './inputDateHelpers';

import { createStore } from 'zustand';

import type { CreateFormStoreProps } from '../types';
import { useState, useId } from 'react';
import { CreateFormStoreBuilder } from './temp';

export const handleCreateFormStore = <Fields, ValidationSchema>(
	params: CreateFormStoreProps<Fields, ValidationSchema>,
) => createStore(CreateFormStoreBuilder(params));

export const useCreateFormStore = <Fields, ValidationSchema>(
	props: Omit<CreateFormStoreProps<Fields, ValidationSchema>, 'baseId'> & {
		baseId?: CreateFormStoreProps<Fields, ValidationSchema>['baseId'];
	},
) => {
	const baseId = useId();
	const formStore = useState(
		handleCreateFormStore({ ...props, baseId: props.baseId || baseId }),
	);

	return formStore[0];
};
