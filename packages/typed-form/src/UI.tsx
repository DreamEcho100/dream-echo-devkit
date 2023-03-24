import type { FieldShape, AllFieldsShape, FormProps, Value } from './types';
import { useFormStore } from './utils';

export const Form = <Fields extends AllFieldsShape>({
	store,
	handleOnSubmit,
	...props
}: FormProps<Fields>) => {
	const { setFieldsError, getFieldErrorFormatter } = useFormStore(
		store,
		(store) => ({
			setFieldsError: store.setFieldsError,
			getFieldErrorFormatter: store.getFieldErrorFormatter,
		}),
	);
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const formFieldsValues: Value<Fields> = {} as Value<Fields>;
				const errors: Partial<Record<keyof Fields, FieldShape['errors']>> = {};
				// event.target.
				const fields = store.getState().fields;

				let fieldName: keyof Fields;
				let field: Fields[keyof Fields];
				for (fieldName in fields) {
					field = fields[fieldName];
					formFieldsValues[fieldName] = field.value;
					if (
						field.validateOnSubmit &&
						typeof field.validationDefaultHandler === 'function'
					) {
						try {
							field.validationDefaultHandler(field.value);
						} catch (error) {
							errors[fieldName] = getFieldErrorFormatter(fieldName)(error);
						}
					}
				}

				if (Object.keys(errors).length > 0) return setFieldsError(errors);
				else if (handleOnSubmit)
					handleOnSubmit({ event, values: formFieldsValues });
			}}
			{...props}
		/>
	);
};
