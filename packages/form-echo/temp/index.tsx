import { z } from 'zod';
import type { FormHTMLAttributes } from 'react';

import type {
	CreateCreateFormStore,
	FormStoreApi,
	HandlePreSubmitCB,
	HandleValidation,
} from '../src';
import { createFormStore, useFormStore } from '../src';
import type { ValidationHandler } from '../src';

const t = {} as CreateCreateFormStore<
	{
		username: string | undefined;
		age: number;
	},
	{
		username: HandleValidation<number>; // (value: string | undefined) => number;
	}
>;

t.fields.username.value;
t.fields.username.validation.handler;

const ttt = createFormStore({
	initValues: {
		username: undefined,
		age: 0,
	},
	validationHandler: {
		username: z.string(),
		age: z.number(),
	},
});

ttt.getState().fields.username.value;
ttt.getState().fields.username.validation.handler;

const Comp = () => {
	const username = useFormStore(ttt, (store) => store.fields.username);

	if (typeof username !== 'string') username;
	if (typeof username === 'string') username;

	return (
		<>
			<Form
				store={ttt}
				handlePreSubmitCB={(event, { values, validatedValues }) => {
					event.preventDefault();
					values.username;
					validatedValues.username;
					return;
				}}
			/>
			<Form2
				store={ttt}
				handleOnSubmit={(event, { values, validatedValues }) => {
					event.preventDefault();
					values.username;
					validatedValues.username;
					return;
				}}
			/>
		</>
	);
};

const Form = <
	Fields extends Record<string, unknown>,
	ValidatedFields extends ValidationHandler<Fields> | undefined,
>({}: {
	store: FormStoreApi<Fields, ValidatedFields>;
	handlePreSubmitCB: HandlePreSubmitCB<Fields, ValidatedFields>;
}) => {
	return <></>;
};

Comp;

/*
type GetStoreFieldsValues<
  Store extends FormStoreApi<any, any>
> = {
  [Key in keyof ReturnType<Store["getState"]>["fields"]]: ReturnType<
    Store["getState"]
  >["fields"][Key]["value"];
};
type GetStoreValidatedFieldsValues<
  Store extends FormStoreApi<any, any>
> = {
  [Key in keyof ReturnType<Store["getState"]>["fields"]]: ReturnType<
    Store["getState"]
  >["fields"][Key]["validation"] extends FieldValidation<any>
    ? ReturnType<Store["getState"]>["fields"][Key]["validation"]["handler"]
    : never;
};

export type FormProps<
  Store extends FormStoreApi<any, any>
> = FormHTMLAttributes<HTMLFormElement> & {
  store: Store;
  handleOnSubmit?: HandlePreSubmitCB<
    GetStoreFieldsValues<Store>,
    GetStoreValidatedFieldsValues<Store>
  >;
};
*/

export type FormProps<
	Fields extends Record<string, unknown>,
	ValidatedFields,
> = FormHTMLAttributes<HTMLFormElement> & {
	store: FormStoreApi<Fields, ValidatedFields>;
	handleOnSubmit?: HandlePreSubmitCB<Fields, ValidatedFields>;
};

const Form2 = <Fields extends Record<string, unknown>, ValidatedFields>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields, ValidatedFields>) => {
	const handlePreSubmit = useFormStore(
		store,
		(state) => state.utils.handlePreSubmit,
	);

	return <form onSubmit={handlePreSubmit(handleOnSubmit)} {...props} />;
};

Form2;
