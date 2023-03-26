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
			value: '',
			validationDefaultHandler: (value) => z.string().parse(value),
		},
		age: {
			value: 0,
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
	const { form } = useFormStore(store, (store) => ({
		form: store.form,
	}));
	return (
		<form
			onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				const formFieldsValues: Value<Fields> = {} as Value<Fields>;
				const errors: Partial<Record<keyof Fields, FieldShape['errors']>> = {};
				const fields = store.getState().fields;
				let fieldName: keyof Fields;
				let field: Fields[keyof Fields];
				let validateOnSubmit: boolean;
				for (fieldName in fields) {
					field = fields[fieldName];
					formFieldsValues[fieldName] = field.value;
					errors[fieldName] = [];
					validateOnSubmit = !!(typeof field.validateOnSubmit === 'boolean'
						? field.validateOnSubmit
						: form.validateAllFieldsOnSubmit);
					if (
						validateOnSubmit &&
						typeof field.validationDefaultHandler === 'function'
					) {
						try {
							field.validationDefaultHandler(field.value);
						} catch (error) {
							console.log('field', field);
							errors[fieldName] = store
								.getState()
								.getFieldErrorFormatter(fieldName)(error);
							console.log('errors[fieldName]', errors[fieldName]);
						}
					}
				}

				store.getState().setFieldsError(errors);

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
	const { field } = useFormStore(store, (store) => ({
		field: store.fields[name],
	}));

	const inputValueStringify = (value: unknown) => {
		if (typeof value === 'string' || typeof value === 'number') return value;
	};

	const _props = {
		...props,
		name: name,
		value: field.storeToFieldFormatter
			? field.storeToFieldFormatter(field.value)
			: field.value, // as string,
		onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
			const errors: Partial<Record<keyof TFields, NonNullable<[] | string[]>>> =
				{};
			let value: unknown = event.target.value;

			try {
				const validationHandler = store
					.getState()
					.getFieldValidateOnChange(name);
				const validateOnChange =
					!!validationHandler &&
					store.getState().getIsFieldValidatingOnChange(name);

				value = field.fieldToStoreFormatter
					? field.fieldToStoreFormatter(value)
					: value;
				value = validateOnChange ? validationHandler(value) : value;
				if (field.isDirty) errors[name] = [];
			} catch (error) {
				errors[name] = store.getState().getFieldErrorFormatter(name)(error);
			}

			store.getState().setFieldValue({ name, value });
			store.getState().setFieldsError(errors);
		},
	};

	return <input type='text' {..._props} className='text-black' />;
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
