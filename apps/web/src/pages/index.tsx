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
import { inputDateHelpers, onFalsy } from '@de100/form-echo/helpers';
import {
	FormStoreApi,
	HandleSubmitCB,
	useCreateFormStore,
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
	const handleSubmit = useStore(store, (state) => state.handleSubmit);
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
	isValueWatched?: boolean;
};
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
	isValueWatched = false,
	...props
}: InputFieldProps<FieldsValues, ValidationsHandlers>) => {
	const value = useStore(store, (store) =>
		isValueWatched ? store.fields[props.name].storeToFieldValue : undefined,
	);
	const metadata = useStore(
		store,
		(store) => store.fields[props.name].metadata,
	);
	const id = useStore(store, (store) => store.fields[props.name].id);
	const getFieldEventsListeners = useStore(
		store,
		(store) => store.getFieldEventsListeners,
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
	username: (val: unknown) => z.string().min(0).max(100).parse(val),
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
				counter: Number,
				dateOfBirth: (value: any) =>
					!value ? null : inputDateHelpers.parseDate(value, 'date'),
			},
			valuesFromStoreToFields: {
				username: onFalsy.toEmptyString,
				dateOfBirth: (value: any) =>
					value ? inputDateHelpers.formatDate(value, 'date') : '',
			},
			// validationEvents: { change: true },
		},
	);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		window.formStore = formStore;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		window.formStoresArr ??= [];
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		window.formStoresArr.push(formStore);
	}

	const username = useStore(formStore, (store) => store.fields.username.value);
	const submit = useStore(formStore, (store) => store.submit);

	useEffect(() => {
		// debugger;
		formStore.getState().handleInputChange('counter', 0);
		const intervalId = setInterval(() => {
			const newCounter = formStore.getState().fields.counter.value + 1;
			formStore.getState().handleInputChange('counter', newCounter);
			if (newCounter === 100) clearInterval(intervalId);
		}, 100);

		return () => {
			clearInterval(intervalId);
		};
	}, [formStore]);

	return (
		<Form
			store={formStore}
			onSubmit={async (params: { values: any; validatedValues: any }) => {
				console.log('Before submission');
				console.log('values', params.values);
				console.log('validatedValues', params.validatedValues);

				await new Promise((res) => {
					console.log('Submission is pending');
					console.log('values', params.values);
					console.log('validatedValues', params.validatedValues);
					setTimeout(res, 2000);
				});
				console.log('After submission');
			}}
			className='flex w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputField store={formStore} name='username' isValueWatched />
			<FieldErrors store={formStore} name='username' />
			<InputField
				store={formStore}
				name='counter'
				type='number'
				isValueWatched
			/>
			<FieldErrors store={formStore} name='counter' />
			<InputField
				store={formStore}
				name='dateOfBirth'
				type='date'
				isValueWatched
			/>
			<FieldErrors store={formStore} name='dateOfBirth' />
			<RandomListGenerator store={formStore} />

			<div className='flex gap-4'>
				<button type='submit' className='capitalize'>
					{submit.isActive ? 'Loading...' : 'submit'}
				</button>
				<button
					type='reset'
					className='capitalize'
					onClick={() => formStore.getState().resetFormStore()}
				>
					reset
				</button>
			</div>

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
	const formStoreUtils = useStore(store, (store) => store);
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
