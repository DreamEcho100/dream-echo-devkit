type ValidationEvents = 'submit' | 'change' | 'mount' | 'blur';

type FieldErrorData =
	| { error: string[]; isDirty: true }
	| { error: null; isDirty: false };

type HandleValidation<Value extends unknown> = (value: unknown) => Value;
type FieldErrorCatcherFormatter = (
	error: unknown,
	eventType: ValidationEvents,
) => string[];

type FieldValidate<Value extends unknown> = {
	defaultHandler?(): HandleValidation<Value>;
	events: {
		[key in ValidationEvents]: {
			handler?(): HandleValidation<Value>;
			counter: { passed: number; failed: number };
		};
	};
	counter: { passed: number; failed: number };
};

// extends string
type FieldShape<Name, Value extends unknown> = FieldErrorData & {
	formatter: {
		errorCatcher?(): FieldErrorCatcherFormatter;
		fieldToStore?(): (value: any) => Value;
		storeToField?(): (value: Value) => any;
	};

	readonly name: Name;
	value: Value;
	initialValue: Value;
	isTouched: boolean;

	validate: FieldValidate<Value>;
};

type FieldNameValue<Value extends unknown = unknown> = Record<
	string,
	{
		value: Value;
		formatter?: {
			errorCatcher?(): FieldErrorCatcherFormatter;
			fieldToStore?(): (value: any) => Value;
			storeToField?(): (value: Value) => any;
		};
	}
>;

type AllFieldsValidateHandler<Fields extends FieldNameValue> = {
	[Key in keyof Fields]: HandleValidation<Fields[Key]['value']>;
};

const validationEvents: ValidationEvents[] = [
	'submit',
	'change',
	'mount',
	'blur',
];

const createFieldValidate = <Value extends unknown>(): FieldValidate<Value> => {
	const events = {} as FieldValidate<Value>['events'];
	for (const eventName of validationEvents) {
		events[eventName] = {
			handler: undefined,
			counter: { failed: 0, passed: 0 },
		};
	}

	return {
		defaultHandler: undefined,
		events,
		counter: { failed: 0, passed: 0 },
	};
};

// Need to handle `fieldsShared` with `fields`
const createStore = <Fields extends FieldNameValue>(params: {
	fields: Fields;
	fieldsShared: {
		errorCatcherFormatter(): FieldErrorCatcherFormatter;
		validateOnBlur: boolean | AllFieldsValidateHandler<Fields>;
		validateOnChange: boolean | AllFieldsValidateHandler<Fields>;
		validateOnMount: boolean | AllFieldsValidateHandler<Fields>;
		validateOnSubmit: boolean | AllFieldsValidateHandler<Fields>;
	};
}): AllFieldsShape<Fields> => {
	type Store = AllFieldsShape<Fields>;
	const fields = {} as Store['fields'];
	const errors = {
		fields: {},
		validationCounter: {
			failed: 0,
			passed: 0,
		},
	} as Store['errors'];
	fields.test;
	const fieldsNames = Object.keys(params.fields) as unknown as (keyof Fields)[];

	let fieldName: keyof Fields;
	for (fieldName of fieldsNames) {
		fields[fieldName] = {
			name: fieldName,
			value: params.fields[fieldName],
			initialValue: params.fields[fieldName],
			error: null,
			isDirty: false,
			isTouched: false,
			formatter: {
				errorCatcher: undefined,
				fieldToStore: undefined,
				storeToField: undefined,
			},
			validate:
				createFieldValidate<(typeof fields)[typeof fieldName]['value']>(),
		};

		errors['fields'][fieldName] = [];
	}

	return {
		fields,
		errors,
		form: { isDirty: false, isTouched: false, submitCounter: 0 },
		// fieldsGlobal: {  }
		// internalUtils: {},
		// utils: {}
	};
};

interface AllFieldsShape<Fields extends FieldNameValue> {
	// fieldsGlobal: {
	// 	errorCatcherFormatter(): FieldErrorCatcherFormatter;
	// 	// validateOnBlur: boolean | AllFieldsValidateHandler<Fields>;
	// 	// validateOnChange: boolean | AllFieldsValidateHandler<Fields>;
	// 	// validateOnMount: boolean | AllFieldsValidateHandler<Fields>;
	// 	// validateOnSubmit: boolean | AllFieldsValidateHandler<Fields>;
	// };
	fields: {
		// [Key in keyof Fields]: Key extends string
		// 	? FieldShape<Key, Fields[Key]['value']>
		// 	: never;
		[Key in keyof Fields]: FieldShape<Key, Fields[Key]['value']>;
	};
	errors: {
		fields: { [Key in keyof Fields]: string[] };
		validationCounter: { passed: number; failed: number };
	};
	form: {
		isDirty: boolean;
		isTouched: boolean;
		submitCounter: number;
	};
	// utils: {
	// 	getAllFieldsNames(): keyof Fields[];
	// 	resetFields(): void;
	// };
	// internalUtils: {};
}

type TestFields = {
	username: { value: string };
	email: { value: string };
	dateOfBirth: { value: string };
	password: { value: string };
};

const testStoreShape = {} as AllFieldsShape<TestFields>;

testStoreShape.fields.dateOfBirth.value;

// const testFieldSharedValidateOnSubmitFunc = {} as Exclude<
// 	(typeof testStoreShape)['fieldsGlobal']['validateOnSubmit'],
// 	boolean
// >['email'];

// testFieldSharedValidateOnSubmitFunc;
// if (typeof testFieldSharedValidateOnSubmitFunc !== 'function')
// 	testFieldSharedValidateOnSubmitFunc; // never

// const testFieldSharedValidateOnSubmitBool = {} as Exclude<
// 	(typeof testStoreShape)['fieldsGlobal']['validateOnSubmit'],
// 	AllFieldsValidateHandler<TestFields>
// >;

// testFieldSharedValidateOnSubmitBool;
// if (typeof testFieldSharedValidateOnSubmitBool !== 'boolean')
// 	testFieldSharedValidateOnSubmitBool; // never
