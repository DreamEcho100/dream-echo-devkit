'use client';
import { FormHTMLAttributes, InputHTMLAttributes, useEffect } from 'react';
import { ZodSchema, z } from 'zod';
import { inputDateHelpers, onFalsy } from '@de100/form-echo/helpers';
import {
	FormStoreApi,
	GetFormStoreApiStore,
	GetValidationValuesFromSchema,
	HandleSubmitCB,
	HandleValidation2,
	ValidValidationSchema,
	createFormStoreBuilder,
	useCreateFormStore,
} from '@de100/form-echo';
import { useStore } from 'zustand';
import { cx } from 'class-variance-authority';

type FormProps<FieldsValues, ValidationSchema> = Omit<
	FormHTMLAttributes<HTMLFormElement>,
	'onSubmit'
> & {
	store: FormStoreApi<FieldsValues, ValidationSchema>;
	onSubmit: HandleSubmitCB<FieldsValues, ValidationSchema>;
};

const Form = <FieldsValues, ValidationSchema>({
	store,
	onSubmit,
	...props
}: FormProps<FieldsValues, ValidationSchema>) => {
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

type FieldProps<FieldsValues, ValidationSchema> = {
	store: FormStoreApi<FieldsValues, ValidationSchema>;
	name: keyof FieldsValues;
	validationName?: keyof ValidationSchema;
	isValueWatched?: boolean;
};
type FieldErrorsProps<FieldsValues, ValidationSchema> = {
	store: FormStoreApi<FieldsValues, ValidationSchema>;
	name?: keyof ValidationSchema & keyof FieldsValues & string;
	validationName?: keyof ValidationSchema;
};

const FieldErrors = <FieldsValues, ValidationSchema>({
	store,
	name,
	validationName,
}: FieldErrorsProps<FieldsValues, ValidationSchema>) => {
	const isDirty = useStore(
		store,
		(store) => store.validations[validationName ?? name].isDirty,
	);
	const errorMessage = useStore(store, (store) => {
		if (!validationName || !name) return;

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

type InputFieldProps<FieldsValues, ValidationSchema> = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'name'
> &
	FieldProps<FieldsValues, ValidationSchema>;

const InputField = <FieldsValues, ValidationSchema>({
	store,
	isValueWatched = false,
	...props
}: InputFieldProps<FieldsValues, ValidationSchema>) => {
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

	const fieldEventsListeners = getFieldEventsListeners(
		props.name,
		props.validationName,
	);

	return (
		<input
			type='text'
			className='px-2 py-1 text-black'
			{...props}
			name={metadata.name}
			id={id}
			value={value}
			// {...getFieldEventsListeners(props.name, props.validationName)}
			{...fieldEventsListeners}
		/>
	);
};

type FormFields = {
	username?: string;
	counter: number;
	dateOfBirth: null | Date;
	testArr: { key: string; title: string }[];
};

const validationSchema = {
	username: (params) => z.string().min(0).max(100).parse(params.value),
	counter: z.number().nonnegative(),
	dateOfBirth: z.date(),
	testExtraValidationItem: (params) => params.getValue('counter') + 10,
	testArrTitles: (params) => {
		const testArr = params.getValue('testArr');
		z.array(z.string()).parse(
			params.getValue('testArr').map((item) => item.title),
		);
		debugger;

		for (const item of testArr) {
			if (typeof item.title === 'number') {
				throw new Error("`testArr` shouldn't contain numbers");
			}
		}

		return testArr;
	},
} satisfies {
	[Key in keyof FormFields | (string & {})]?: Key extends keyof FormFields
		? HandleValidation2<FormFields, Record<string, unknown>, Key> | ZodSchema
		:
				| HandleValidation2<FormFields, Record<string, unknown>, string>
				| ZodSchema;
};

/*
Record<
	string,
	HandleValidation2<FormFields, Record<string, unknown>, string> | ZodSchema
>;
*/

const RandomListGenerator = <
	FieldsValues extends { testArr: FormFields['testArr'] },
	ValidationSchema,
>({
	store,
}: {
	store: FormStoreApi<FieldsValues, ValidationSchema>;
}) => {
	const setFieldValue = useStore(store, (store) => store.setFieldValue);
	const testArr = useStore(store, (store) => store.fields.testArr.value);

	return (
		<>
			<button
				type='button'
				onClick={() => {
					const randomNum = Math.random();
					setFieldValue('testArr', (prev) => [
						...prev,
						{
							key:
								randomNum > 0.8 ? randomNum : randomNum.toString(36).slice(2),
							title:
								randomNum > 0.8 ? randomNum : randomNum.toString(36).slice(2),
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
								setFieldValue('testArr', (prev) =>
									prev.filter((_item) => _item.key !== item.key),
								);
							}}
						>
							x
						</button>
					</li>
				))}
			</ul>
		</>
	);
};

export default function FormEcho() {
	// <FormFields, typeof validationSchema>
	const formStore = useCreateFormStore({
		initialValues: {
			username: 'Test',
			counter: 1,
			dateOfBirth: null, // new Date(),
			testArr: [],
		} as FormFields,
		validationSchema: {
			username: (params) => z.string().min(0).max(100).parse(params.value),
			counter: z.number().nonnegative(),
			dateOfBirth: z.date(),
			testExtraValidationItem: (params) => params.getValue('counter') + 10,
			testArrTitles: (params) => {
				return z
					.array(z.string())
					.parse(params.getValue('testArr').map((item) => item.title));
				// const testArr = params.getValue('testArr');

				// for (const item of testArr) {
				// 	if (typeof item.title === 'number') {
				// 		throw new Error("`testArr` shouldn't contain numbers");
				// 	}
				// }

				// return testArr;
			},
		} satisfies ValidValidationSchema<FormFields>, //validationSchema,
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
	});

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

	type TT = GetValidationValuesFromSchema<
		GetFormStoreApiStore<typeof formStore, 'validationSchemas'>
	>;
	const tt = {} as TT;
	tt.testArrTitles;

	return (
		<Form
			store={formStore}
			onSubmit={async (params) => {
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
			<FieldErrors store={formStore} validationName='testArrTitles' />

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
}
