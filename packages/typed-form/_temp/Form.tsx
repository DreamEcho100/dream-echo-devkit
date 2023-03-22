import * as React from 'react';

interface FormFieldProps<TProps extends StringRecord<string, unknown>> {
	name: keyof TProps;
	value: TProps[keyof TProps];
	handleValidation: (
		value: TProps[keyof TProps],
	) => TProps[keyof TProps] | undefined;
}
type StringRecord<K extends string, T> = {
	[P in K]: T;
};
type TypedChildren<TProps extends StringRecord<string, unknown>> =
	// keyof TProps extends string ?
	React.ReactElement<FormFieldProps<TProps>>[];
// : never

// interface FormProps<
// 	TChildren extends TypedChildren<string, unknown> | Omit<any, 'TypedChildren'>,
// > {
// 	children: TChildren
// 	handleOnSubmit: (
// 		event: React.FormEvent<HTMLFormElement>,
// 		formValues: TChildren extends TypedChildren<string, unknown>
// 			? Record<
// 					TChildren[number]['props']['name'],
// 					TChildren[number]['props']['value']
// 			  >
// 			: never,
// 	) => void
// }
type FormProps<TChildren extends unknown> = TChildren extends TypedChildren<{
	[TName: string]: unknown;
}>
	? {
			children: TChildren;
			handleOnSubmit: (
				event: React.FormEvent<HTMLFormElement>,
				formValues: // Pick<TChildren[number]['props'], 'name' | 'value'>,
				Record<
					TChildren[number]['props']['name'],
					TChildren[number]['props']['value']
				>,
			) => void;
	  }
	: never;

export const Form = <TChildren extends any>({
	children,
	handleOnSubmit,
}: FormProps<TChildren>) => {
	return (
		<form onSubmit={(event) => handleOnSubmit(event, {} as any)}>
			{children}
		</form>
	);
};

const TestComponent = () => {
	return (
		<>
			<Form
				handleOnSubmit={(event, formValues) => {
					formValues.lol;
				}}
			>
				<FormField
					type='text'
					name='lol'
					id=''
					value={2}
					test={(p) => {
						return;
					}}
				/>
				<FormField type='text' name='lol' id='' value={2} />
			</Form>
		</>
	);
};

const FormField = <const TName extends string, Value extends string | number>(
	props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'name'> & {
		name: TName;
		value: Value;
		test?: (p: TName) => void;
	},
) => {
	return (
		<>
			<input type='text' {...props} />
		</>
	);
};
