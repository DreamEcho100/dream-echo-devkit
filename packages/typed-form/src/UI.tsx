import type { TFieldsShape, TFormProps, TValue } from './types';
import { useFormStore } from './utils';

export const Form = <TFields extends TFieldsShape>({
	store,
	handleOnSubmit,
	// customValidationOnSubmit,
	...props
}: TFormProps<TFields>) => {
	useFormStore(store, (store) => ({ setFieldsError: store.setFieldsError }));
	return (
		<form
			onSubmit={(event) => {
				if (!handleOnSubmit) return;

				event.preventDefault();
				const formFieldsValues: TValue<TFields> = {} as TValue<TFields>;
				const errors: Partial<Record<keyof TFields, string>> = {};
				const fields = store.getState().fields;

				let fieldName: keyof TFields; // typeof fields
				for (fieldName in fields) {
					const field = fields[fieldName];
					formFieldsValues[fieldName] = field.value;
					if (
						field.validateOnSubmit &&
						typeof field.handleValidation === 'function'
					) {
						try {
							field.handleValidation(field.value);
						} catch (error) {
							if (error instanceof Error) errors[fieldName] = error.message;
						}
					}
				}

				if (Object.keys(errors).length > 0)
					return store.getState().setFieldsError(errors);
				else handleOnSubmit({ event, values: formFieldsValues });
			}}
			{...props}
		/>
	);
};
