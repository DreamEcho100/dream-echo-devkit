import type { StoreApi } from 'zustand';

export type TFieldShape = {
	value: unknown;
	handleValidation?: (value: unknown) => void;
	validateOnChange?: boolean;
	validateOnSubmit?: boolean;
	error?: string;
	hasValueChangedSinceLastError?: boolean;
};

export type TFieldsShape = Record<string, TFieldShape>;

export type TFormStoreDataShape<TFields extends TFieldsShape> = {
	shared: {
		validateOnChange?: boolean;
		validateOnSubmit: boolean;
	};
	fields: TFields;
	setFieldValue: <TName extends keyof TFields>(params: {
		name: TName;
		value: TFields[TName]['value'];
		validateOnChange: TFields[TName]['validateOnChange'];
	}) => void;
	setFieldsError: (errors: Partial<Record<keyof TFields, string>>) => void;
};

export type TFormStoreApi<TFields extends TFieldsShape> = StoreApi<
	TFormStoreDataShape<TFields>
>;

export type TValue<TFields extends TFieldsShape> = Record<
	keyof TFields,
	TFields[keyof TFields]['value']
>;

export type TFormProps<TFields extends TFieldsShape> =
	React.FormHTMLAttributes<HTMLFormElement> & {
		store: TFormStoreApi<TFields>;
		handleOnSubmit?: (params: {
			event: React.FormEvent<HTMLFormElement>;
			values: TValue<TFields>;
		}) => void;
		// customValidationOnSubmit?: (values: TValue<TFields>) => void
	};
