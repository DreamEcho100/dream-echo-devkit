# General Outline

A store logic to use with `zustand` and `zod` for form values, validation, and errors, it's supposed to have the following features:

- A Headless UI.
- Easy field validations.
- field/s validation can be customized and working on different like on Change and Submit.

- Tracking the field:
  - `isDirty`.
  - validation for the events `submit`, `change` .while tracking their `passed` and `failed` validation attempts.
  - `errors` resulted from the validation of fields.
  - field `metadata` like `id`, `name`, and `initialValue`.

## Creating a store

This library is supposed to be just the store logic and used with `zustand` and `zod`, which would lead to the flexibility of creating the form components

First, we will import the following as we will need them

```ts
import { z } from 'zod';
import { useCreateFormStore, inputDateHelpers } from '@de100/form-echo';
```

Then let's define the `FormFields` and the `FormValidationSchema`

```ts
type FormFields = {
	username: string;
	counter: number;
	dateOfBirth: null | Date;
	testArr: string[];
};

const FormValidationSchema = {
	counter: z.number().nonnegative(),
	dateOfBirth: z.date(),
	username: (val: unknown) => z.string().min(1).max(4).parse(val),
};
```

As you can see we will use `zod` as it's an awesome library for validation

Now let's build the store

```tsx
const Example = () => {
	const formStore = useCreateFormStore<FormFields, typeof FormValidationSchema>(
		{
			initValues: {
				username: 'Test',
				counter: 1,
				dateOfBirth: null, // new Date(),
			},
			valuesFromFieldsToStore: {
				counter: (value) => Number(value),
				dateOfBirth: (value) => inputDateHelpers.parseDate(value, 'date'),
			},
			validationSchema: FormValidationSchema,
			valuesFromStoreToFields: {
				dateOfBirth: (value) =>
					value ? inputDateHelpers.formatDate(value, 'date') : '',
			},
			validationEvents: { change: true },
		},
	);

	return <>{/* ... */}</>;
};
```

### `initValues`

This will be the initial values that will be on the store and we could use on the form fields.

### `valuesFromFieldsToStore`

This will be handy to take the values from the fields and transform it to a another type before validating.

Note that the following can be transformed from

```ts
{
	counter: (value) => Number(value),
	// ...
}
```

To

```ts
{
	counter: Number,
	// ...
}
```

and it will work!

### `validationSchema`

This will be how we will handle the validation of the form values before we set them on the store, The syntax could also be written as

```ts
{
		username: ((value: string) => z.number().nonnegative().parse(value)),
		counter: ((value: string) => z.number().nonnegative()),
		dateOfBirth: ((value: string) => z.date().parse(value)),
}
```

But if you just passed the `zod` schema it will be converted to it internally for your convince.

### `valuesFromStoreToFields`

We will use this to transform the store field value to a type that is accepted as a `value` for the form field, more on that later.

### `validationEvents`

Used to specify when the validation should occur.

Supporting `submit` and `change`, as the event `submit` is default to `true`.

## Building the form components

As it's been said previously this library is only the logic for handling the form, which will lead to more freedom for building the components.

We will build the components that will be used on the return of the following example

```tsx
import { z } from 'zod';
import { useCreateFormStore, inputDateHelpers } from '@de100/form-echo';

type FormFields = {
	username: string;
	counter: number;
	dateOfBirth: null | Date;
	testArr: string[];
};

const FormValidationSchema = {
	username: (val: unknown) => z.string().min(1).max(4).parse(val),
	counter: z.number().nonnegative(),
	dateOfBirth: z.date(),
};

const Example = () => {
	const formStore = useCreateFormStore<FormFields, typeof FormValidationSchema>(
		{
			initValues: {
				username: 'Test',
				counter: 1,
				dateOfBirth: null, // new Date(),
			},
			validationSchema: FormValidationSchema,
			valuesFromFieldsToStore: {
				counter: (value) => Number(value),
				dateOfBirth: (value) => inputDateHelpers.parseDate(value, 'date'),
			},
			valuesFromStoreToFields: {
				dateOfBirth: (value) =>
					value ? inputDateHelpers.formatDate(value, 'date') : '',
			},
			validationEvents: { change: true },
		},
	);

	return (
		<Form
			store={formStore}
			handleOnSubmit={(event, { values, validatedValues }) => {
				console.log('values', values);
				console.log('validatedValues', validatedValues.counter);
			}}
			className='flex w-fit flex-col gap-2 bg-neutral-500 p-4 text-white'
		>
			<InputField store={formStore} name='username' />
			<FieldErrors store={formStore} name='username' />
			<InputField store={formStore} name='counter' type='number' />
			<FieldErrors store={formStore} name='counter' />
			<InputField store={formStore} name='dateOfBirth' type='date' />
			<FieldErrors store={formStore} name='dateOfBirth' />
			<button type='submit'>Submit</button>
		</Form>
	);
};
```

The components are `Form`, `InputField`, `FieldErrors`

> Note we will Typescript generics to be able to achieve type safety and autocompletion

### The custom `Form` component

Let's start with a simple `FormProps`

```ts
import { type FormStoreApi, type HandlePreSubmitCB } from '@de100/form-echo';

type FormProps<Fields, ValidatedField> = Omit<
	FormHTMLAttributes<HTMLFormElement>,
	'onSubmit'
> & {
	store: FormStoreApi<Fields, ValidatedField>;
	onSubmit: HandlePreSubmitCB<Fields, ValidatedField>;
};
```

Simple ha, don't worry we will go on it part by part

1.  `Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>`:
    We will use the `FormHTMLAttributes<HTMLFormElement>` just to be able to pass the attributes of the form element, but we will have to **remove** the `onSubmit` since we will override it.
    In here comes the Typescript `Omit` utility to help as it will firstly take the object and secondly will take the key _or a union of keys_ to remove from the object `Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>`

2.  We will add to the `Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'>` two other object properties using the `&`

    ```ts
    {
    	store: FormStoreApi<Fields, ValidatedField>;
    	onSubmit: HandlePreSubmitCB<Fields, ValidatedField>;
    }
    ```

3.  `store: FormStoreApi<Fields, ValidatedField>;`:
    This will be the object reference of the created form store

4.  `onSubmit: HandlePreSubmitCB<Fields, ValidatedField>;`:
    This will be our custom `onSubmit` callback which we will use along with another utility from the store to be able to use the previous logic

    ```ts
    const Example = () => {
    	// ...

    	return (
    		<Form
    			store={formStore}
    			onSubmit={(event, { values, validatedValues }) => {
    				console.log('values', values);
    				console.log('validatedValues', validatedValues.counter);
    			}}
    			// ...
    		>
    			{/* ... */}
    		</Form>
    	);
    };
    ```

Now we will build the `Form` component

```tsx
const Form = <Fields, ValidatedField>({
	store,
	onSubmit,
	...props
}: FormProps<Fields, ValidatedField>) => {
	const handlePreSubmit = useStore(
		store,
		(state) => state.utils.handlePreSubmit,
	);

	return <form onSubmit={handlePreSubmit(onSubmit)} {...(props as any)} />;
};
```

We will access the the `handlePreSubmit` from the `store` as it will pass the form fields `values` and `validatedValues`

### The custom `InputField` component

[Updating the README.md is still in progress :P]
