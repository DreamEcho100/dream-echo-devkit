import { Button } from 'ui';
import {
	createFormStore,
	useFormStore,
	FormStoreApi,
	inputDateHelpers,
	HandlePreSubmitCB,
} from 'form-echo';
import { FormHTMLAttributes, InputHTMLAttributes, useId, useMemo } from 'react';
import { z } from 'zod';

export type FormProps<Fields extends Record<string, unknown>> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: FormStoreApi<Fields>;
		handleOnSubmit?: HandlePreSubmitCB<Fields>;
	};

export const Form = <Fields extends Record<string, unknown>>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields>) => {
	const handlePreSubmit = useFormStore(
		store,
		(state) => state.utils.handlePreSubmit,
	);

	return <form onSubmit={handlePreSubmit(handleOnSubmit)} {...props} />;
};

export type FieldProps<Fields extends Record<string, unknown>> = {
	store: FormStoreApi<Fields>;
	name: keyof Fields;
};

const FieldErrors = <Fields extends Record<string, unknown>>({
	store,
	name,
}: FieldProps<Fields>) => {
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

export type InputFieldProps<Fields extends Record<string, unknown>> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<Fields>;

const InputField = <Fields extends Record<string, unknown>>({
	store,
	...props
}: InputFieldProps<Fields>) => {
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
	const baseId = useId();
	const formStore = useMemo(
		() =>
			createFormStore({
				baseId,
				initValues: {
					username: 'Test',
					counter: 1,
					dateOfBirth: new Date(),
				},
				validationHandler: {
					counter: z.number().nonnegative(),
					dateOfBirth: z.date(),
					username: z.string().min(1).max(4),
				},
				valuesFromFieldsToStore: {
					counter: (value) => Number(value),
					dateOfBirth: (value) => inputDateHelpers.parseDate(value, 'date'),
				},
				valuesFromStoreToFields: {
					dateOfBirth: (value) => inputDateHelpers.formatDate(value, 'date'),
				},
				validationEvents: { change: true },
			}),
		[baseId],
	);

	return (
		<Form
			store={formStore}
			handleOnSubmit={(event, { values }) => {
				console.log('values', values);
			}}
			className='flex
			w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputField store={formStore} name='username' />
			<FieldErrors store={formStore} name='username' />
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
