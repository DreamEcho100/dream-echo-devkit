/**
 * a headless lib where `zustand` is used for state management
 *
 * To be implemented
 *
 * - Customizable Error Messages for each field.
 * - Asynchronous Validation.
 * - Form Persistence Mechanism.
 * - Localization and Internationalization (i18n).
 * - Accessibility Features.
 * - Custom Hooks.
 *
 *
 * Ideas:
 * - from oneform <https://docs.oneform.dev/>:
 * 	- The use React.Children API to render the form fields <https://github.com/Sawtaytoes/OneForm/blob/master/packages/react/src/Field.jsx>.
 *
 * - from react-hook-form <https://react-hook-form.com/>:
 * 	- The use of the `useFieldArray` hook to manage dynamic form fields <https://react-hook-form.com/docs/usefieldarray>.
 *
 */

/*
TODO:
- Work on the deep external resolver schema paths and values inference.
- Use the word input or external with resolvers?
- A deep inference for arrays too.
*/
/******************************** old implementation refactoring starts here ********************************/
import type { infer as ZodInfer } from 'zod';
import { ZodSchema } from 'zod';
/******************************** useful types starts here ********************************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TFunction = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/ban-types
export type OtherStrings = string & {};
export type AnyValueExceptFunctions = // eslint-disable-next-line @typescript-eslint/ban-types
	Exclude<{}, TFunction> | null | undefined;
type InferValueByPath<
	Values,
	Path extends InferValuesPaths<Values> | OtherStrings
> = Path extends `${infer Key}.${infer Rest}`
	? Key extends keyof Values
		? InferValueByPath<Values[Key], Rest>
		: never
	: Path extends keyof Values
	? Values[Path]
	: never;
// it should also work with arrays and tuples and objects
type InferValuesPaths<Values, Paths = ''> = Values extends object
	? {
			[Key in keyof Values]: Values[Key] extends object
				? Paths extends ''
					? Key | InferValuesPaths<Values[Key], Key>
					:
							| `${Paths & string}.${Key & string}`
							| InferValuesPaths<
									Values[Key],
									`${Paths & string}.${Key & string}`
							  >
				: Paths extends ''
				? Key
				: `${Paths & string}.${Key & string}`;
	  }[keyof Values]
	: never;
/*
interface TestValues {
	test: 0;
	test2: {
		test2_1: true;
		test2_2: {
			test2_3: 'lol';
		};
	};
}
type TestValuesPaths = InferValuesPaths<TestValues>;
type TestValuesPathToPath = InferValueByPath<
	TestValues,
	TestValuesPaths // 'test2.test2_2.test2_3'
	>;
	*/

interface FormStoreResolverParams<
	Values,
	ExternalResolvers,
	Key extends keyof Values | OtherStrings,
	ResolverError
> {
	get: () => FormStoreShape<Values, Record<string, unknown>, ResolverError>;
	value: Key extends keyof Values ? Values[Key] : never;
}
export type ValidExternalResolverSchema<Values, ErrorShape> = {
	[Key in keyof Values | OtherStrings]?:
		| ZodSchema
		| ((
				params: FormStoreResolverParams<
					Values,
					Record<string, unknown>,
					Key,
					ErrorShape
				>
		  ) => unknown);
};

/******************************** useful types ends here ********************************/

/** @description - used to get the values of the form. */
type GetValue = <Values, Path extends InferValuesPaths<Values>>(
	path: Path
) => InferValueByPath<Values, Path>;

type ResolverBaseShape = {
	[key: string]: {
		rules: ResolverRules;
		handler: ResolverHandler;
	};
};
type ResolverHandlerParam<Values, Resolvers extends ResolverBaseShape, Path> = {
	/** @description - used to set the errors of the form, by passing the path _(separated by dotes)_ of the error which is the paths of the `resolvers`. */
	setErrors: (path: keyof Resolvers, message: string) => void;
	getValue: GetValue;
	// /** @description - used to get the resolver of the form, by passing the path _(separated by dotes)_ of the resolver. */
	// getResolver: <Path extends keyof Resolvers>(
	// 	path: Path
	// ) => Resolvers[Path]['handler'];
} & (InferValueByPath<Values, Path> extends infer Value
	? Value extends never
		? { name: never; value: never }
		: { name: Path; value: Value }
	: { name: never; value: never });
type ResolverHandlerResult<Value> = { value: Value } | { error: Error };
/** @description - used to handle the form validation. */
type ResolverHandler = <Values, Resolvers extends ResolverBaseShape, Path>(
	param: ResolverHandlerParam<Values, Resolvers, Path>
) => ResolverHandlerResult<InferValueByPath<Values, Path>>;
/******************************** old implementation refactoring ends here ********************************/

/******************************** new implementation starts here ********************************/
interface CurrentField<Name> {
	name: Name;
	at: number;
}

interface ResolverRules {
	required?: boolean;
	min?: number;
	max?: number;
	pattern?: RegExp;
	minLength?: number;
	maxLength?: number;
	multiple?: boolean;
	step?: number;
}

type GetPaths<Schema> = Schema extends object
	? {
			[Key in keyof Schema]:
				| Key
				| `${Key & string}.${GetPaths<Schema[Key]> & string}`;
	  }[keyof Schema]
	: never;

type GetResolverPathsToCB<Schema> = Schema extends object
	? {
			[Key in keyof Schema]: Schema[Key] extends () => any
				? Key
				: `${Key & string}.${GetResolverPathsToCB<Schema[Key]> & string}`;
	  }[keyof Schema]
	: never;

type GetResolverValues<Schema> = Schema extends object
	? GetResolverPathsToCB<Schema> extends infer Resolver
		? Resolver extends Record<string, unknown>
			? {
					[Key in keyof Resolver]: Resolver[Key] extends () => infer Value
						? Value
						: GetResolverValues<Resolver[Key]>;
			  }
			: never
		: never
	: never;

interface FormStoreShape<
	Values,
	InputResolverSchema extends ValidExternalResolverSchema<
		Values,
		ResolverError
	>,
	ResolverError = Error
> {
	fields: {
		values: Values;
		initialValues: Values;
		touched: {
			fields: { [Key in keyof Values]: false };
			count: number;
			last: null | CurrentField<keyof Values>;
		};
		focused: null | CurrentField<keyof Values>;
		changing: null | CurrentField<keyof Values>;

		setValue: (name: keyof Values, value: Values[keyof Values]) => void;
		setValues: (values: Partial<Values>) => void;
		setTouched: (name: keyof Values, value: boolean) => void;
		setTouchedAll: (value: boolean) => void;
		reset: (
			values?: Partial<Values>,
			options?: {
				keepTouched?: boolean;
				keepFocused?: boolean;
				keepChanging?: boolean;
			}
		) => void;
	};
	resolvers: {
		schema: GetResolverPathsToCB<InputResolverSchema>;
		rules: {
			[Key in GetPaths<InputResolverSchema>]?: ResolverRules;
		};
		errors: {
			fields: { [Key in GetPaths<InputResolverSchema>]?: ResolverError | null };
			count: number;
		};

		isDirty: boolean;
		isValidating: boolean;
		setIs: (target: 'dirty' | 'validating', value: boolean) => void;

		setError: (
			name: GetPaths<InputResolverSchema>,
			error: ResolverError
		) => void;
		setErrors: (errors: {
			[Key in GetPaths<InputResolverSchema>]?: ResolverError;
		}) => void;
		reset: (options?: { keepErrors?: boolean; keepIsDirty?: boolean }) => void;
	};
	submit: {
		state: 'idle' | 'pending' | 'rejected' | 'resolved';
		pendingCount: number;
		rejectedCount: number;
		resolvedCount: number;

		isPending: boolean;
		isRejected: boolean;
		isResolved: boolean;
		setIs: (
			target: 'pending' | 'rejected' | 'resolved',
			value: boolean
		) => void;

		handler: <Event>(
			submit: (
				params: {
					event: Event;
					values: Values;
					resolvedValues: GetResolverValues<InputResolverSchema>;
				},
				options?: {
					onResolved?:
						| ((resolvedValues: GetResolverValues<InputResolverSchema>) => void)
						| {
								resetForm?: boolean;
								resetErrors?: boolean;
								resetValidation?: boolean;
								resetSubmitState?: boolean;
						  };
					onRejected?: (error: ResolverError) => void;
					onPending?: () => void;

					onFinally?: () => void;
				}
			) => void | Promise<void>
		) => void;
		reset: (options?: {
			keepCount?:
				| boolean
				| ['pending' | 'rejected' | 'resolved']
				| 'all'
				| 'pending'
				| 'rejected'
				| 'resolved';
			keepState?: boolean;
		}) => void;
	};
	metadata: { id: string };
	utils: {
		reset: (options?: {
			values?: Partial<Values>;
			keepTouched?: boolean;
			keepFocused?: boolean;
			keepChanging?: boolean;
			keepErrors?: boolean;
			keepIsDirty?: boolean;
			keepSubmitCount?:
				| boolean
				| ['pending' | 'rejected' | 'resolved']
				| 'all'
				| 'pending'
				| 'rejected'
				| 'resolved';
			keepSubmitState?: boolean;
		}) => void;

		// onFocus: (name: keyof Values) => void;
		// onBlur: (name: keyof Values) => void;
		// onChange: (name: keyof Values) => void;
		// onFocusNext: () => void;
		// onFocusPrevious: () => void;
		// onReset: () => void;
	};
}
/******************************** new implementation ends here ********************************/

/*
const schema = z.object({
	name: z.string().min(3).max(255),
	email: z.string().email(),
	age: z.number().min(18).max(99),
	address: z.object({
		street: z.string(),
		city: z.string(),
	}),
});
const resolvedRules = {
	name: {
		required: true,
		minLength: 3,
		maxLength: 255,
	},
	email: {
		required: true,
		pattern: /@/,
	},
	age: {
		required: true,
		min: 18,
		max: 99,
	},
	'address.street': {
		required: true,
	},
	'address.city': {
		required: true,
	},
}
const resolvedSchema = {
	name: (params) => z.string().min(3).max(255).parse(params.value),
	email: (params) => z.string().email().parse(params.value),
	age: (params) => z.number().min(18).max(99).parse(params.value),
	'address.street': (params) => z.string().parse(params.value),
	'address.city': (params) => z.string().parse(params.value),
}
*/
