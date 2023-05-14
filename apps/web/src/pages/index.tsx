import { Button } from 'ui';
import {
	FormHTMLAttributes,
	InputHTMLAttributes,
	useEffect,
	useId,
	useMemo,
} from 'react';
import { z } from 'zod';
import {
	FormStoreApi,
	HandlePreSubmitCB,
	// useStore,
	useCreateFormStore,
	inputDateHelpers,
} from '@de100/form-echo';
import { useStore } from 'zustand';

type FormProps<Fields, ValidatedField> = Omit<
	FormHTMLAttributes<HTMLFormElement>,
	'onSubmit'
> & {
	store: FormStoreApi<Fields, ValidatedField>;
	onSubmit: HandlePreSubmitCB<Fields, ValidatedField>;
};

const Form = <Fields, ValidatedField>({
	store,
	onSubmit,
	...props
}: FormProps<Fields, ValidatedField>) => {
	const handlePreSubmit = useStore(
		store,
		(state) => state.utils.handlePreSubmit,
	);

	return <form onSubmit={handlePreSubmit(onSubmit)} {...props} />;
};

type FieldProps<Fields, ValidatedField> = {
	store: FormStoreApi<Fields, ValidatedField>;
	name: keyof Fields;
};

const FieldErrors = <Fields, ValidatedField>({
	store,
	name,
}: FieldProps<Fields, ValidatedField>) => {
	const isDirty = useStore(store, (store) => store.fields[name].isDirty);
	const errors = useStore(store, (store) => store.fields[name].errors);

	if (!isDirty) return <></>;

	return (
		<ul>
			{errors!.map((error) => (
				<p key={error}>{error}</p>
			))}
		</ul>
	);
};

type InputFieldProps<Fields, ValidatedField> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<Fields, ValidatedField>;

const InputField = <Fields, ValidatedField>({
	store,
	...props
}: InputFieldProps<Fields, ValidatedField>) => {
	const value = useStore(store, (store) => {
		const field = store.fields[props.name];
		return field.valueFromStoreToField
			? field.valueFromStoreToField(field.value)
			: field.value;
	}) as string;
	const metadata = useStore(
		store,
		(store) => store.fields[props.name].metadata,
	);
	const handleOnInputChange = useStore(
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

type FormFields = {
	username: string;
	counter: number;
	dateOfBirth: null | Date;
	testArr: string[];
};

const FormValidationSchema = {
	username: (val: unknown) => z.string().min(1).max(4).parse(val),
	counter: z.number().nonnegative(),
	dateOfBirth: z.date(),
};

const Example = () => {
	const formStore = useCreateFormStore<FormFields, typeof FormValidationSchema>(
		{
			initValues: {
				username: 'Test',
				counter: 1,
				dateOfBirth: null, // new Date(),
				testArr: [],
			},
			validationSchema: FormValidationSchema,
			valuesFromFieldsToStore: {
				counter: (value) => Number(value),
				dateOfBirth: (value) => inputDateHelpers.parseDate(value, 'date'),
			},
			valuesFromStoreToFields: {
				dateOfBirth: (value) =>
					value ? inputDateHelpers.formatDate(value, 'date') : '',
			},
			validationEvents: { change: true },
		},
	);

	const formStoreUtils = useStore(formStore, (store) => store.utils);
	const testArr = useStore(formStore, (store) => store.fields.testArr.value);

	useEffect(() => {
		formStoreUtils.setFieldValue('username', (prev) => prev + ' 1?');
	}, [formStoreUtils]);

	return (
		<Form
			store={formStore}
			onSubmit={(event, { values, validatedValues }) => {
				console.log('values', values);
				console.log('validatedValues', validatedValues.counter);
			}}
			className='flex flex-col gap-2 p-4 text-white w-fit bg-neutral-500'
		>
			<InputField store={formStore} name='username' />
			<FieldErrors store={formStore} name='username' />
			<InputField store={formStore} name='counter' type='number' />
			<FieldErrors store={formStore} name='counter' />
			<InputField store={formStore} name='dateOfBirth' type='date' />
			<FieldErrors store={formStore} name='dateOfBirth' />

			<button
				type='button'
				onClick={() => {
					formStoreUtils.setFieldValue('testArr', (prev) => [
						Math.random().toString(36).slice(2),
						...prev,
					]);
				}}
			>
				Add To Random String Arr List
			</button>
			<ul>
				{testArr.map((item) => (
					<li key={item} className='flex justify-between gap-1'>
						{item}{' '}
						<button
							type='button'
							onClick={() => {
								formStoreUtils.setFieldValue('testArr', (prev) =>
									prev.filter((_item) => _item !== item),
								);
							}}
						>
							x
						</button>
					</li>
				))}
			</ul>
			<button type='submit'>Submit</button>
		</Form>
	);
};

const Web = () => {
	return (
		<div>
			<h1 className='w-full h-full text-3xl font-bold underline'>
				Hello world!
			</h1>
			<Example />
		</div>
	);
};

export default Web;
