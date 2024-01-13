'use client';

import type { ValidValidationSchema } from '@de100/form-echo';
import type { PropsWithFormStore } from '@de100/form-echo/react/zustand';

import { useEffect } from 'react';
import { z } from 'zod';
import { inputDateHelpers, onFalsy } from '@de100/form-echo/helpers';
import { useCreateFormStore } from '@de100/form-echo/react/zustand';
import { useStore } from 'zustand';
import { InputControl, Errors, Form, ErrorsBase } from './FormComponents';

interface FormValues {
	username?: string;
	counter: number;
	dateOfBirth: null | Date;
	testArr: { key: string; title: string }[];
}

const initialValues: FormValues = {
	username: 'Test',
	counter: 1,
	dateOfBirth: null,
	testArr: [],
};

const validationSchema = {
	username: (params) => z.string().min(0).max(100).parse(params.value),
	counter: z.number().nonnegative(),
	dateOfBirth: z.date(),
	testExtraValidationItem: (params) => params.getControlValue('counter') + 10,
	testArrTitles: (params) => {
		return z
			.array(z.string())
			.min(1)
			.parse(params.getControlValue('testArr').map((item) => item.title));
	},
	testArrTitles2: (params) => {
		const testArr = params.getControlValue('testArr');

		for (const item of testArr) {
			if (typeof item.title === 'number') {
				throw new Error("`testArr` shouldn't contain numbers");
			}
		}

		return testArr;
	},
} satisfies ValidValidationSchema<FormValues>;

function RandomListGenerator<
	FieldsValues extends { testArr: FormValues['testArr'] },
	ValidationSchema extends ValidValidationSchema<FieldsValues>,
>(props: PropsWithFormStore<FieldsValues, ValidationSchema>) {
	const setControlValue = useStore(
		props.store,
		(store) => store.setControlValue,
	);
	const testArr = useStore(
		props.store,
		(store) => store.controls.testArr.value,
	);

	return (
		<fieldset>
			<legend className='capitalize'>random list</legend>
			<button
				type='button'
				onClick={() => {
					const randomNum = Math.random();
					setControlValue('testArr', (prev) => [
						...prev,
						{
							key:
								randomNum > 0.5 ? randomNum : randomNum.toString(36).slice(2),
							title:
								randomNum > 0.5 ? randomNum : randomNum.toString(36).slice(2),
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
								setControlValue('testArr', (prev) =>
									prev.filter((_item) => _item.key !== item.key),
								);
							}}
						>
							x
						</button>
					</li>
				))}
			</ul>
		</fieldset>
	);
}

export default function FormEcho() {
	const formStore = useCreateFormStore({
		initialValues,
		validationSchema,
		valuesFromControlsToStore: {
			counter: Number,
			dateOfBirth: (value) =>
				!value ? null : inputDateHelpers.parseDate(value, 'date'),
		},
		valuesFromStoreToControls: {
			username: onFalsy.toEmptyString,
			dateOfBirth: (value) =>
				value ? inputDateHelpers.formatDate(value, 'date') : '',
		},
	});

	if (typeof window !== 'undefined') window.formStore = formStore;

	const isSubmitting = useStore(formStore, (store) => store.submit.isPending);
	const submitError = useStore(formStore, (store) => store.submit.error);

	useEffect(() => {
		formStore.getState().handleControlChange('counter', 0);

		const intervalId = setInterval(() => {
			const newCounter = formStore.getState().controls.counter.value + 1;
			formStore.getState().handleControlChange('counter', newCounter);
			if (newCounter <= 100) clearInterval(intervalId);
		}, 100);

		return () => {
			clearInterval(intervalId);
		};
	}, [formStore]);

	return (
		<Form
			store={formStore}
			onSubmit={async (params) => {
				console.log('Before submission');
				console.log('values', params.values);
				console.log('validatedValues', params.validatedValues);

				console.log('\n\n\n');
				console.log('Submission is pending');
				console.log('\n\n\n');

				await new Promise((res) => {
					console.log('After submission');
					console.log('values', params.values);
					console.log('validatedValues', params.validatedValues);
					setTimeout(res, 2000);
				});
			}}
			className='flex w-full max-w-sm flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputControl store={formStore} name='username' />
			<Errors store={formStore} validationName='username' />

			<InputControl store={formStore} name='counter' type='number' />
			<Errors store={formStore} validationName='counter' />

			<InputControl store={formStore} name='dateOfBirth' type='date' />
			<Errors store={formStore} validationName='dateOfBirth' />

			<RandomListGenerator store={formStore} />
			<Errors
				store={formStore}
				validationName='testArrTitles'
				controlName='testArr'
				ignoreFocus
			/>
			<Errors
				store={formStore}
				validationName='testArrTitles2'
				controlName='testArr'
				ignoreFocus
			/>

			<div className='flex gap-4'>
				<button type='submit' className='capitalize'>
					{isSubmitting ? 'Loading...' : 'submit'}
				</button>
				<button
					type='reset'
					className='capitalize'
					onClick={() => formStore.getState().resetFormStore()}
				>
					reset
				</button>
			</div>

			<ErrorsBase error={submitError} />
		</Form>
	);
}
