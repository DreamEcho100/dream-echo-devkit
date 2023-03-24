import { z } from 'zod';
import { Form } from './UI';
import { createFormStore, useFormStore } from './utils';
import { TFieldsShape, TInputFieldProps } from './types';

const formStore = createFormStore({
	shared: {
		validateOnChange: true,
		validateOnSubmit: true,
	},
	fields: {
		name: {
			value: '',
			handleValidation: (value) => z.string().parse(value),
		},
		age: {
			value: 0,
			handleValidation: (value) => z.number().parse(value),
		},
	},
});

const InputField = <TFields extends TFieldsShape>({
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
						field.validateOnChange && field.handleValidation
							? field.handleValidation(event.target.value)
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
