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
	useFormStore,
	createFormStore,
	inputDateHelpers,
} from '@de100/form-echo';

export type FormProps<Fields, ValidatedField> =
	FormHTMLAttributes<HTMLFormElement> & {
		store: FormStoreApi<Fields, ValidatedField>;
		handleOnSubmit?: HandlePreSubmitCB<Fields, ValidatedField>;
	};

export const Form = <Fields extends Record<string, unknown>, ValidatedField>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields, ValidatedField>) => {
	const handlePreSubmit = useFormStore(
		store,
		(state) => state.utils.handlePreSubmit,
	);

	return <form onSubmit={handlePreSubmit(handleOnSubmit)} {...props} />;
};

export type FieldProps<Fields, ValidatedField> = {
	store: FormStoreApi<Fields, ValidatedField>;
	name: keyof Fields;
};

const FieldErrors = <Fields extends Record<string, unknown>, ValidatedField>({
	store,
	name,
}: FieldProps<Fields, ValidatedField>) => {
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

export type InputFieldProps<Fields, ValidatedField> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<Fields, ValidatedField>;

const InputField = <Fields extends Record<string, unknown>, ValidatedField>({
	store,
	...props
}: InputFieldProps<Fields, ValidatedField>) => {
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
					dateOfBirth: null, // new Date(),
					testArr: [],
				} as {
					username: string;
					counter: number;
					dateOfBirth: null | Date;
					testArr: string[];
				},
				validationHandler: {
					counter: z.number().nonnegative(),
					dateOfBirth: z.date(),
					username: (val: unknown) => z.string().min(1).max(4).parse(val),
				},
				valuesFromFieldsToStore: {
					counter: (value) => Number(value),
					dateOfBirth: (value) => inputDateHelpers.parseDate(value, 'date'),
				},
				valuesFromStoreToFields: {
					dateOfBirth: (value) =>
						value ? inputDateHelpers.formatDate(value, 'date') : '',
				},
				validationEvents: { change: true },
			}),
		[baseId],
	);
	type t = ReturnType<
		(typeof formStore)['getState']
	>['fields']['counter']['validation']['handler'];
	type tt = ReturnType<t> extends number ? number : never;

	const setFieldValue = useFormStore(
		formStore,
		(store) => store.utils.setFieldValue,
	);
	const testArr = useFormStore(
		formStore,
		(store) => store.fields.testArr.value,
	);

	useEffect(() => {
		setFieldValue('username', (prev) => prev + ' 1?');
	}, [setFieldValue]);

	return (
		<Form
			store={formStore}
			handleOnSubmit={(event, { values, validatedValues }) => {
				console.log('values', values);
				console.log('validatedValues', validatedValues.counter);
			}}
			className='flex w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
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
					setFieldValue('testArr', (prev) => [
						Math.random().toString(36).slice(2),
						...prev,
					]);
				}}
			>
				Add To Test Arr List
			</button>
			<ul>
				{testArr.map((item) => (
					<li key={item} className='flex justify-between gap-1'>
						{item}{' '}
						<button
							type='button'
							onClick={() => {
								setFieldValue('testArr', (prev) =>
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
			<h1 className='h-full w-full text-3xl font-bold underline'>
				Hello world!
			</h1>
			<Example />
		</div>
	);
};

export default Web;
