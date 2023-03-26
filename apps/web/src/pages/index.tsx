import { Button } from 'ui';
import {
	createFormStore,
	AllFieldsShape,
	FormProps,
	useFormStore,
	Value,
	FieldShape,
	InputFieldProps,
	FieldProps,
} from 'typed-form';
import React, { useMemo } from 'react';
import { z } from 'zod';

const formStore = createFormStore({
	fieldsShared: {
		validateOnChange: false,
		validateOnSubmit: true,
	},
	fields: {
		name: {
			initialValue: '',
			validationDefaultHandler: (value) => z.string().parse(value),
		},
		age: {
			initialValue: 0,
			validationDefaultHandler: (value) =>
				z.number().nonnegative().parse(value),
			fieldToStoreFormatter: (value: string) => Number(value),
			storeToFieldFormatter: (value: number) => value.toString(),
		},
	},
});

export const Form = <Fields extends AllFieldsShape>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields>) => {
	const form = useFormStore(store, (store) => store.form);
	return (
		<form
			onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				const storeState = store.getState();
				const formFieldsValues: Value<Fields> = {} as Value<Fields>;
				const errors: Partial<Record<keyof Fields, FieldShape['errors']>> = {};
				const fields = storeState.fields;
				const values = storeState.values;
				let fieldName: keyof typeof values;
				let field: Fields[keyof typeof fields];
				let validateOnSubmit: boolean;

				for (fieldName in values) {
					field = fields[fieldName];
					formFieldsValues[fieldName] = values[fieldName];
					errors[fieldName] = [];
					validateOnSubmit = !!(typeof field.validateOnSubmit === 'boolean'
						? field.validateOnSubmit
						: form.validateAllFieldsOnSubmit);
					if (
						validateOnSubmit &&
						typeof field.validationDefaultHandler === 'function'
					) {
						try {
							field.validationDefaultHandler(values[fieldName]);
						} catch (error) {
							console.log('field', field);
							errors[fieldName] = store
								.getState()
								.getFieldErrorFormatter(fieldName)(error);
							console.log('errors[fieldName]', errors[fieldName]);
						}
					}
				}

				storeState.setFieldsError(errors);

				if (handleOnSubmit) handleOnSubmit({ event, values: formFieldsValues });
			}}
			{...props}
		/>
	);
};

const FieldErrors = <TFields extends AllFieldsShape>({
	store,
	name,
}: FieldProps<TFields>) => {
	const { field } = useFormStore(store, (store) => ({
		field: store.fields[name],
	}));

	if (!field.isDirty) return <></>;

	return (
		<ul>
			{field.errors.map((error) => (
				<p key={error}>{error}</p>
			))}
		</ul>
	);
};

const InputField = <TFields extends AllFieldsShape>({
	store,
	...props
}: InputFieldProps<TFields>) => {
	const name = useMemo(() => props.name, [props.name]);
	const value = useFormStore(store, (store) => store.values[name]);

	return (
		<input
			type='text'
			className='text-black'
			{...props}
			name={name}
			value={
				typeof store.getState().fields[name].storeToFieldFormatter !==
				'undefined'
					? store.getState().fields[name].storeToFieldFormatter?.(value)
					: value
			}
			onChange={(event) => {
				const errors: Partial<
					Record<keyof TFields, NonNullable<[] | string[]>>
				> = {};
				let value: unknown = event.target.value;
				const storeState = store.getState();

				try {
					const validationHandler = storeState.getFieldValidateOnChange(name);
					const validateOnChange =
						!!validationHandler &&
						storeState.getIsFieldValidatingOnChange(name);
					const field = storeState.fields[name];

					value = field.fieldToStoreFormatter
						? field.fieldToStoreFormatter(value)
						: value;
					value = validateOnChange ? validationHandler(value) : value;
					if (field.isDirty) errors[name] = [];
				} catch (error) {
					errors[name] = storeState.getFieldErrorFormatter(name)(error);
				}

				storeState.setFieldValue({ name, value });
				storeState.setFieldsError(errors);
			}}
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
			<InputField store={formStore} name='age' />
			<FieldErrors store={formStore} name='age' />
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
