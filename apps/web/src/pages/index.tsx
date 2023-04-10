import { Button } from 'ui';
import {
	createFormStore,
	useFormStore,
	PassedAllFieldsShape,
	FormStoreApi,
	inputDateHelpers,
} from 'typed-form';
import React, {
	FormEvent,
	FormHTMLAttributes,
	InputHTMLAttributes,
	useMemo,
} from 'react';
import { z } from 'zod';

const formStore = createFormStore({
	fields: {
		name: 'Test',
		counter: {
			value: 1,
			valueFromFieldToStore: (value) => Number(value),
		},
		dateOfBirth: {
			value: new Date(),
			valueFromFieldToStore: (value) =>
				inputDateHelpers.parseDate(value, 'date'),
			valueFromStoreToField: (value: Date) =>
				inputDateHelpers.formatDate(value, 'date'),
		},
	},
	validationsHandler: {
		counter: (value) => z.number().nonnegative().parse(value),
		dateOfBirth: (value) => z.date().parse(value),
		name: (value) => z.string().min(1).max(4).parse(value),
	},
	validation: { change: true },
});

export type FormProps<Fields extends PassedAllFieldsShape> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: FormStoreApi<Fields>;
		handleOnSubmit?: (params: {
			event: FormEvent<HTMLFormElement>;
			values: Fields; // { [Key in keyof TFields]: TFields[Key]['value'] }// Value<TFields>;
		}) => void;
	};

export const Form = <Fields extends PassedAllFieldsShape>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields>) => {
	// const form = useFormStore(store, (store) => store.form);
	return (
		<form
			onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				const currentStore = store.getState();
				const fields = currentStore.fields;
				const values = {} as Fields;

				let fieldName: keyof typeof fields;
				for (fieldName in fields) {
					values[fieldName] = fields[fieldName]
						.value as (typeof values)[typeof fieldName];
				}

				handleOnSubmit?.({
					event,
					values,
				});
			}}
			{...props}
		/>
	);
};

export type FieldProps<TFields extends PassedAllFieldsShape> = {
	store: FormStoreApi<TFields>;
	name: keyof TFields;
};

const FieldErrors = <TFields extends PassedAllFieldsShape>({
	store,
	name,
}: FieldProps<TFields>) => {
	const isDirty = useFormStore(store, (store) => store.fields[name].isDirty);
	const errors = useFormStore(store, (store) => store.fields[name].errors);

	if (!isDirty) return <></>;

	return (
		<ul>
			{errors!.map((error) => (
				<p key={error}>{error}</p>
			))}
		</ul>
	);
};

export type InputFieldProps<TFields extends PassedAllFieldsShape> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<TFields>;

const InputField = <TFields extends PassedAllFieldsShape>({
	store,
	...props
}: InputFieldProps<TFields>) => {
	const name = useMemo(() => props.name, [props.name]);
	const value = useFormStore(store, (store) => store.fields[name].value);
	const valueFromStoreToField = useFormStore(
		store,
		(store) => store.fields[name].valueFromStoreToField,
	);

	return (
		<input
			type='text'
			className='px-2 py-1 text-black'
			{...props}
			// @ts-ignore
			name={name}
			// @ts-ignore
			value={valueFromStoreToField ? valueFromStoreToField(value) : value}
			onChange={(event) => {
				const currentStore = store.getState();
				const value = currentStore.utils.handleFieldValidation({
					name,
					value: event.target.value,
					validationEvent: 'change',
				});
				currentStore.utils.setFieldValue(props.name, value);
			}}
		/>
	);
};

const Example = () => {
	return (
		<Form
			store={formStore}
			handleOnSubmit={({ values }) => {
				console.log('values', values);
			}}
			className='flex
			w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputField store={formStore} name='name' />
			<FieldErrors store={formStore} name='name' />
			<InputField store={formStore} name='counter' type='number' />
			<FieldErrors store={formStore} name='counter' />
			<InputField store={formStore} name='dateOfBirth' type='date' />
			<FieldErrors store={formStore} name='dateOfBirth' />
			<button type='submit'>Submit</button>
		</Form>
	);
};

const Web = () => {
	return (
		<div>
			<h1 className='h-full w-full text-3xl font-bold underline'>
				Hello world!
			</h1>
			<Example />
		</div>
	);
};

export default Web;
