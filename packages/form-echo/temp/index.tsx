import { z } from 'zod';
import type { FormHTMLAttributes } from 'react';

import type {
	CreateCreateFormStore,
	FormStoreApi,
	HandlePreSubmitCB,
	HandleValidation,
} from '../src';
import { createFormStore, useFormStore } from '../src';

const ee = {} as CreateCreateFormStore<
	{
		username: string | undefined;
		age: number;
	},
	{
		username: HandleValidation<number>; // (value: string | undefined) => number;
	}
>;

ee.fields.username.value;
ee.fields.username.validation.handler;

const eee = createFormStore({
	initValues: {
		username: undefined,
		age: 0,
	},
	validationHandler: {
		username: z.string(),
		age: z.number(),
	},
});

eee.getState().fields.username.value;
eee.getState().fields.username.validation.handler;

const Comp = () => {
	const username = useFormStore(eee, (store) => store.fields.username);

	if (typeof username !== 'string') username;
	if (typeof username === 'string') username;

	return (
		<>
			<Form
				store={eee}
				handlePreSubmitCB={(event, { values, validatedValues }) => {
					event.preventDefault();
					values.username;
					validatedValues.username;
					return;
				}}
			/>
			<Form2
				store={eee}
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

const Form = <Fields extends Record<string, unknown>, ValidatedFields>({
	store,
}: {
	store: FormStoreApi<Fields, ValidatedFields>;
	handlePreSubmitCB: HandlePreSubmitCB<Fields, ValidatedFields>;
}) => {
	store.getState().fields.sa.errors;
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

const validationHandlerSchema = {
	username: z.string(), //.optional(),
	age: (val: unknown) => z.number().parse(val),
};

const t = createFormStore({
	initValues: { username: null, age: '0' } as {
		username?: null | string;
		age: string;
	},
	validationHandler: validationHandlerSchema,
});

t.getState().utils.handlePreSubmit((_event, { validatedValues, values }) => {
	validatedValues.username;
	validatedValues.age;
	values;
});

t.getState().fields.username.value;
t.getState().fields.username.validation.handler;

t.getState().fields.age.value;
t.getState().fields.age.validation.handler;

type IV = { username: null | string; age: string };

type FF = CreateCreateFormStore<IV, typeof validationHandlerSchema>;

const tt = {} as FF;

// tt.___?.username;
// tt._?.username;

tt.fields.username.value;
tt.fields.username.validation.handler;
type _ttUsername = typeof tt.fields.username.validation.handler;
const rUsername = tt.fields.username.validation.handler('', 'change');
rUsername;

tt.fields.age.value;
tt.fields.age.validation.handler;
type _ttAge = ReturnType<typeof tt.fields.age.validation.handler>;
const rAge = tt.fields.age.validation.handler('', 'change');
rAge;
