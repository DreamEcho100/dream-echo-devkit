import { Button } from 'ui';
import {
	createFormStore,
	useFormStore,
	PassedAllFieldsShape,
	FormStoreApi,
	inputDateHelpers,
} from 'form-echo';
import { FormEvent, FormHTMLAttributes, InputHTMLAttributes } from 'react';
import { z } from 'zod';

const formStore = createFormStore({
	initValues: {
		name: 'Test',
		counter: 1,
		dateOfBirth: new Date(),
	},
	validationsHandler: {
		counter: z.number().nonnegative(),
		dateOfBirth: z.date(),
		name: z.string().min(1).max(4),
	},
	valuesFromFieldsToStore: {
		counter: (value) => Number(value),
		dateOfBirth: (value) => inputDateHelpers.parseDate(value, 'date'),
	},
	valuesFromStoreToFields: {
		dateOfBirth: (value) => inputDateHelpers.formatDate(value, 'date'),
	},
	validation: { change: true },
});

export type FormProps<Fields extends PassedAllFieldsShape> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: FormStoreApi<Fields>;
		handleOnSubmit?: (params: {
			event: FormEvent<HTMLFormElement>;
			values: Fields;
		}) => void;
	};

export const Form = <Fields extends PassedAllFieldsShape>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields>) => {
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
	const value = useFormStore(store, (store) => {
		const field = store.fields[props.name];
		return field.valueFromStoreToField
			? field.valueFromStoreToField(field.value)
			: field.value;
	}) as string;
	const metadata = useFormStore(
		store,
		(store) => store.fields[props.name].metadata,
	);
	const handleOnInputChange = useFormStore(
		store,
		(store) => store.utils.handleOnInputChange,
	);

	return (
		<input
			type='text'
			className='px-2 py-1 text-black'
			{...props}
			name={metadata.name}
			id={metadata.id}
			value={value}
			onChange={(event) => handleOnInputChange(props.name, event.target.value)}
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
