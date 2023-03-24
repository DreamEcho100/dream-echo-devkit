import { z } from 'zod';
import { Form } from './UI';
import { createFormStore, useFormStore } from './utils';
import { TAllFieldsShape, TInputFieldProps } from './types';

const formStore = createFormStore({
	fieldsShared: {
		// validateOnChange: true,
		validateOnSubmit: true,
	},
	fields: {
		name: {
			value: '',
			validationDefaultHandler: (value) => z.string().parse(value),
		},
		age: {
			value: 0,
			validationDefaultHandler: (value) => z.number().parse(value),
		},
	},
});

const InputField = <TFields extends TAllFieldsShape>({
	store,
	...props
}: TInputFieldProps<TFields>) => {
	const { field, setFieldValue, errFormatter, setFieldsError } = useFormStore(
		store,
		(store) => ({
			field: store.fields[props.name],
			setFieldValue: store.setFieldValue,
			errFormatter: store.getFieldErrorFormatter(props.name),
			setFieldsError: store.setFieldsError,
		}),
	);

	return (
		<input
			type='text'
			{...props}
			name={props.name}
			onChange={(event) => {
				try {
					const value =
						field.validateOnChange && field.validationDefaultHandler
							? field.validationDefaultHandler(event.target.value)
							: event.target.value;

					setFieldValue({ name: props.name, value });
				} catch (error) {
					setFieldsError({ [props.name]: errFormatter(error) });
				}
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
		></Form>
	);
};

export default Example;
