// import { Button } from 'ui';
import { FormHTMLAttributes, InputHTMLAttributes, useEffect } from 'react';
import { z } from 'zod';
import {
	FormStoreApi,
	HandleSubmitCB,
	useCreateFormStore,
	inputDateHelpers,
} from '@de100/form-echo';
import { useStore } from 'zustand';
import { cx } from 'class-variance-authority';

type FormProps<FieldsValues, ValidationsHandlers> = Omit<
	FormHTMLAttributes<HTMLFormElement>,
	'onSubmit'
> & {
	store: FormStoreApi<FieldsValues, ValidationsHandlers>;
	onSubmit: HandleSubmitCB<FieldsValues, ValidationsHandlers>;
};

const Form = <FieldsValues, ValidationsHandlers>({
	store,
	onSubmit,
	...props
}: FormProps<FieldsValues, ValidationsHandlers>) => {
	const handleSubmit = useStore(store, (state) => state.utils.handleSubmit);
	const isDirty = useStore(store, (state) => state.isDirty);

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			{...props}
			className={cx(
				isDirty && 'ring-2 ring-inset ring-red-500',
				props.className,
			)}
		/>
	);
};

type FieldProps<FieldsValues, ValidationsHandlers> = {
	store: FormStoreApi<FieldsValues, ValidationsHandlers>;
	name: keyof FieldsValues;
	validationName?: keyof ValidationsHandlers;
};
type FieldErrorsProps<FieldsValues, ValidationsHandlers> = {
	store: FormStoreApi<FieldsValues, ValidationsHandlers>;
	validationName: keyof ValidationsHandlers;
};

const FieldErrors = <FieldsValues, ValidationsHandlers>({
	store,
	validationName,
}: FieldErrorsProps<FieldsValues, ValidationsHandlers>) => {
	const isDirty = useStore(
		store,
		(store) => store.validations[validationName].isDirty,
	);
	const errorMessage = useStore(store, (store) => {
		const validation = store.validations[validationName];
		return validation.isDirty && validation.error.message;
	});

	if (!isDirty) return <></>;

	return <ul>{errorMessage && <li>{errorMessage}</li>}</ul>;
};

type InputFieldProps<FieldsValues, ValidationsHandlers> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<FieldsValues, ValidationsHandlers>;

const InputField = <FieldsValues, ValidationsHandlers>({
	store,
	...props
}: InputFieldProps<FieldsValues, ValidationsHandlers>) => {
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
	const id = useStore(store, (store) => store.fields[props.name].id);

	return (
		<input
			type='text'
			className='px-2 py-1 text-black'
			{...props}
			name={metadata.name}
			id={id}
			value={value}
			onChange={(event) =>
				store
					.getState()
					.utils.handleOnInputChange(props.name, event.target.value)
			}
		/>
	);
};

type FormFields = {
	username?: string;
	counter: number;
	dateOfBirth: null | Date;
	testArr: { key: string; title: string }[];
};

const FormValidationSchema = {
	username: (val: unknown) => z.string().min(1).max(4).parse(val),
	counter: z.number().nonnegative(),
	dateOfBirth: z.date(),
	testExtraValidationItem: (fields: FormFields) => fields.counter + 10,
};

const Example = () => {
	const formStore = useCreateFormStore(
		// <FormFields, typeof FormValidationSchema>
		{
			initialValues: {
				username: 'Test',
				counter: 1,
				dateOfBirth: null, // new Date(),
				testArr: [],
			} as FormFields,
			validationsHandlers: {
				...FormValidationSchema,
				testArrTitles: (fields) =>
					z.array(z.string()).parse(fields.testArr.map((item) => item.title)),
			},
			valuesFromFieldsToStore: {
				counter: (value) => Number(value),
				dateOfBirth: (value) =>
					!value ? null : inputDateHelpers.parseDate(value, 'date'),
			},
			valuesFromStoreToFields: {
				username: (value) => value ?? '',
				dateOfBirth: (value) =>
					value ? inputDateHelpers.formatDate(value, 'date') : '',
			},
			validationEvents: { change: true },
		},
	);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (typeof window !== 'undefined') window.formStore = formStore;

	const formStoreUtils = useStore(formStore, (store) => store.utils);
	const testArr = useStore(formStore, (store) => store.fields.testArr.value);
	const username = useStore(formStore, (store) => store.fields.username.value);

	useEffect(() => {
		formStore.getState().utils.handleOnInputChange('username', '99');
	}, [formStore, formStoreUtils]);

	return (
		<Form
			store={formStore}
			onSubmit={({ values, validatedValues }) => {
				console.log('values', values);
				console.log('validatedValues', validatedValues);
			}}
			className='flex w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputField store={formStore} name='username' />
			<FieldErrors store={formStore} validationName='username' />
			<InputField store={formStore} name='counter' type='number' />
			<FieldErrors store={formStore} validationName='counter' />
			<InputField store={formStore} name='dateOfBirth' type='date' />
			<FieldErrors store={formStore} validationName='dateOfBirth' />

			<button
				type='button'
				onClick={() => {
					formStoreUtils.setFieldValue('testArr', (prev) => [
						...prev,
						{
							key: Math.random().toString(36).slice(2),
							title: Math.random().toString(36).slice(2),
						},
					]);
				}}
			>
				Add To Random String Arr List
			</button>
			<ul>
				{testArr.map((item) => (
					<li key={item.key} className='flex justify-between gap-1'>
						{item.title}{' '}
						<button
							type='button'
							onClick={() => {
								formStoreUtils.setFieldValue('testArr', (prev) =>
									prev.filter((_item) => _item.key !== item.key),
								);
							}}
						>
							x
						</button>
					</li>
				))}
			</ul>
			<button type='submit' className='capitalize'>
				submit
			</button>
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
