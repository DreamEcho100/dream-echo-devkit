'use client';

import type { FormHTMLAttributes, InputHTMLAttributes } from 'react';
import type {
	PropsWithFormStoreControl,
	PropsWithFormStoreForm,
	PropsWithFormStoreValidationItem,
} from '@de100/form-echo/react/zustand';

import { useMemo } from 'react';
import {
	useGetControlErrorProps,
	useGetControlProps,
	useStore,
} from '@de100/form-echo/react/zustand';
import type { FormError } from '@de100/form-echo';
import { cx } from 'class-variance-authority';

// InputField component
export function InputControl<FieldsValues, ValidationSchema>({
	store,
	...props
}: PropsWithFormStoreControl<
	FieldsValues,
	ValidationSchema,
	InputHTMLAttributes<HTMLInputElement>
>) {
	const controlProps = useGetControlProps({
		store,
		name: props.name,
		validationName: props.validationName,
	});
	const fieldEventsListeners = useMemo(
		() =>
			controlProps.getControlEventsListeners(props.name, props.validationName),
		[controlProps, props.name, props.validationName],
	);

	return (
		<input
			className='px-2 py-1 text-black'
			{...fieldEventsListeners}
			{...controlProps.base}
			{...props}
		/>
	);
}

export function ErrorsBase(props: { error?: FormError | null }) {
	if (!props.error) return null;

	if (Array.isArray(props.error)) {
		return (
			<ul>
				{props.error.map((err, index) => (
					<li key={index}>
						<p>
							<strong>{err.path.join(' -> ')}:&nbsp;</strong>
							{err.message}
						</p>
					</li>
				))}
			</ul>
		);
	}

	return <p>{props.error.message}</p>;
}

// FieldErrors component
export function Errors<FieldsValues, ValidationSchema>(
	props: PropsWithFormStoreValidationItem<
		FieldsValues,
		ValidationSchema,
		{ ignoreFocus?: boolean }
	>,
) {
	const controlErrorProps = useGetControlErrorProps(props);

	const isHidden = controlErrorProps.isFocused || !controlErrorProps.error;
	console.group(props.controlName, props.validationName);
	console.log('controlErrorProps.isFocused', controlErrorProps.isFocused);
	console.log('controlErrorProps.error', controlErrorProps.error);
	console.groupEnd();

	if (isHidden) return null;

	return <ErrorsBase error={controlErrorProps.error} />;
}

// Form component
export function Form<FieldsValues, ValidationSchema>({
	store,
	...props
}: PropsWithFormStoreForm<
	FieldsValues,
	ValidationSchema,
	FormHTMLAttributes<HTMLFormElement>
>) {
	const handleSubmit = useStore(store, (state) => state.handleSubmit);
	const isDirty = useStore(
		store,
		(state) => !!(state.submit.error || state.validations.isDirty),
	);

	return (
		<form
			{...props}
			onSubmit={handleSubmit(props.onSubmit)}
			className={cx(
				isDirty && 'ring-2 ring-inset ring-red-500',
				props.className,
			)}
		/>
	);
}
