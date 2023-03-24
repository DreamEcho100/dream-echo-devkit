import type {
	TFieldsShape,
	TFormProps,
	TInputFieldProps,
	TValue,
} from './types';
import { useFormStore } from './utils';

export const Form = <TFields extends TFieldsShape>({
	store,
	handleOnSubmit,
	// customValidationOnSubmit,
	...props
}: TFormProps<TFields>) => {
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
				if (!handleOnSubmit) return;

				event.preventDefault();
				const formFieldsValues: TValue<TFields> = {} as TValue<TFields>;
				const errors: Partial<Record<keyof TFields, string>> = {};
				const fields = store.getState().fields;

				let fieldName: keyof TFields; // typeof fields
				let field: TFields[keyof TFields];
				for (fieldName in fields) {
					field = fields[fieldName];
					formFieldsValues[fieldName] = field.value;
					if (
						field.validateOnSubmit &&
						typeof field.handleValidation === 'function'
					) {
						try {
							field.handleValidation(field.value);
						} catch (error) {
							errors[fieldName] = getFieldErrorFormatter(fieldName)(error);
						}
					}
				}

				// store.getState().
				if (Object.keys(errors).length > 0) return setFieldsError(errors);
				else handleOnSubmit({ event, values: formFieldsValues });
			}}
			{...props}
		/>
	);
};
