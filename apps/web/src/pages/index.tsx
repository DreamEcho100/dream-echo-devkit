// import { Button } from 'ui';
import {
	FormHTMLAttributes,
	InputHTMLAttributes,
	JSXElementConstructor,
	Key,
	PromiseLikeOfReactNode,
	ReactElement,
	ReactFragment,
	ReactPortal,
	useEffect,
} from 'react';
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
} & (
	| {
			name: keyof FieldsValues;
			validationName: keyof ValidationsHandlers;
	  }
	| {
			name: keyof FieldsValues & keyof ValidationsHandlers;
			validationName?: undefined;
	  }
);
type FieldErrorsProps<FieldsValues, ValidationsHandlers> = {
	store: FormStoreApi<FieldsValues, ValidationsHandlers>;
	name: keyof ValidationsHandlers & keyof FieldsValues & string;
	validationName?: keyof ValidationsHandlers;
};

const FieldErrors = <FieldsValues, ValidationsHandlers>({
	store,
	name,
	validationName,
}: FieldErrorsProps<FieldsValues, ValidationsHandlers>) => {
	const isDirty = useStore(
		store,
		(store) => store.validations[validationName ?? name].isDirty,
	);
	const errorMessage = useStore(store, (store) => {
		const validation = store.validations[validationName ?? name];
		return validation.isDirty && validation.error.message;
	});
	const isFocused = useStore(
		store,
		(store) => store.focus.field?.name === name,
	);
	const focus = useStore(store, (store) => store.focus);

	console.log('\n\n\n', name, isFocused);
	console.log('isFocused', isFocused);
	console.log('errorMessage', errorMessage);
	console.log('isDirty', isDirty);
	console.log('focus', focus);

	if (isFocused || !isDirty) return <></>;

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
	const value = useStore(
		store,
		(store) => store.fields[props.name].storeToFieldValue,
	);
	const metadata = useStore(
		store,
		(store) => store.fields[props.name].metadata,
	);
	const id = useStore(store, (store) => store.fields[props.name].id);
	const getFieldEventsListeners = useStore(
		store,
		(store) => store.utils.getFieldEventsListeners,
	);

	return (
		<input
			type='text'
			className='px-2 py-1 text-black'
			{...props}
			name={metadata.name}
			id={id}
			value={value}
			{...getFieldEventsListeners(props.name, props.validationName)}
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
				testArrTitles: (fields: { testArr: any[] }) =>
					z
						.array(z.string())
						.parse(fields.testArr.map((item: { title: any }) => item.title)),
			},
			valuesFromFieldsToStore: {
				counter: (value: any) => Number(value),
				dateOfBirth: (value: any) =>
					!value ? null : inputDateHelpers.parseDate(value, 'date'),
			},
			valuesFromStoreToFields: {
				username: (value: any) => value ?? '',
				dateOfBirth: (value: any) =>
					value ? inputDateHelpers.formatDate(value, 'date') : '',
			},
			// validationEvents: { change: true },
		},
	);

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	if (typeof window !== 'undefined') window.formStore = formStore;

	const formStoreUtils = useStore(formStore, (store) => store.utils);
	// const username = useStore(formStore, (store) => store.fields.username.value);
	const submit = useStore(formStore, (store) => store.submit);

	useEffect(() => {
		formStore.getState().utils.handleOnInputChange('username', '99');
	}, [formStore, formStoreUtils]);

	return (
		<Form
			store={formStore}
			onSubmit={async (params: { values: any; validatedValues: any }) => {
				console.log('Before submission');
				await new Promise((res) => {
					console.log('values', params.values);
					console.log('validatedValues', params.validatedValues);
					setTimeout(res, 2000);
				});
				console.log('After submission');
			}}
			className='flex w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputField store={formStore} name='username' />
			<FieldErrors store={formStore} name='username' />
			<InputField store={formStore} name='counter' type='number' />
			<FieldErrors store={formStore} name='counter' />
			<InputField store={formStore} name='dateOfBirth' type='date' />
			<FieldErrors store={formStore} name='dateOfBirth' />
			<RandomListGenerator store={formStore} />

			<button type='submit' className='capitalize'>
				{submit.isActive ? 'Loading...' : 'submit'}
			</button>

			{submit.errorMessage && <p>{submit.errorMessage}</p>}
		</Form>
	);
};

const RandomListGenerator = <
	FieldsValues extends { testArr: FormFields['testArr'] },
	ValidationsHandlers,
>({
	store,
}: {
	store: FormStoreApi<FieldsValues, ValidationsHandlers>;
}) => {
	const formStoreUtils = useStore(store, (store) => store.utils);
	const testArr = useStore(store, (store) => store.fields.testArr.value);

	return (
		<>
			<button
				type='button'
				onClick={() => {
					formStoreUtils.setFieldValue('testArr', (prev: any) => [
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
				{testArr.map(
					(item: {
						key: Key | null | undefined;
						title:
							| string
							| number
							| boolean
							| ReactElement<any, string | JSXElementConstructor<any>>
							| ReactFragment
							| ReactPortal
							| PromiseLikeOfReactNode
							| null
							| undefined;
					}) => (
						<li key={item.key} className='flex justify-between gap-1'>
							{item.title}{' '}
							<button
								type='button'
								onClick={() => {
									formStoreUtils.setFieldValue('testArr', (prev: any[]) =>
										prev.filter(
											(_item: { key: any }) => _item.key !== item.key,
										),
									);
								}}
							>
								x
							</button>
						</li>
					),
				)}
			</ul>
		</>
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
