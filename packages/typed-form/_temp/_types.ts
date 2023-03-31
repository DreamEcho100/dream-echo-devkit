/*

// @ts-ignore
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
		[key in ValidationEvents]?:
			| boolean
			| {
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
		validate?: {
			events: {
				[key in ValidationEvents]?: boolean | HandleValidation<Value>;
			};
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

type FieldsShared<Fields extends FieldNameValue> = {
	errorCatcherFormatter(): FieldErrorCatcherFormatter;
	validate: {
		events: {
			[key in ValidationEvents]?: boolean | AllFieldsValidateHandler<Fields>;
		};
	};
};

const createFieldValidate = <
	Fields extends FieldNameValue,
	Name extends keyof Fields,
>(
	fieldsShared: FieldsShared<Fields>,
	field: Fields[Name],
	fieldName: Name,
): FieldValidate<Fields[Name]['value']> => {
	const events = {} as FieldValidate<Fields[Name]['value']>['events'];
	for (const eventName of validationEvents) {
		const fieldEventsValidate = field.validate?.events[eventName];
		const fieldValidate = fieldEventsValidate
			? fieldEventsValidate
			: typeof fieldsShared.validate?.events[eventName] !== 'undefined'
			? (() => {
					const eventValidation = fieldsShared.validate.events[eventName]!;
					if (typeof eventValidation === 'boolean') return eventValidation;

					const fieldEventValidation = eventValidation[fieldName];

					if (!fieldEventValidation) return false;

					return fieldEventValidation;
			  })()
			: false;

		events[eventName] =
			typeof fieldValidate === 'boolean'
				? fieldValidate
				: {
						handler: fieldValidate as any, // as Exclude<HandleValidation<Fields[Name]["value"]>, boolean>,
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
	fieldsShared: FieldsShared<Fields>;
}): AllFieldsShape<Fields> => {
	const fieldsShared = params.fieldsShared || {};
	type Store = AllFieldsShape<Fields>;
	const fields = {} as Store['fields'];
	const errors = {
		fields: {},
		validationCounter: {
			failed: 0,
			passed: 0,
		},
	} as Store['form']['errors'];
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
				errorCatcher: fieldsShared.errorCatcherFormatter || undefined,
				fieldToStore: undefined,
				storeToField: undefined,
			},
			validate: createFieldValidate<Fields, typeof fieldName>(
				fieldsShared,
				params.fields[fieldName],
				fieldName,
			),
		};

		errors['fields'][fieldName] = [];
	}

	return {
		fields,
		// @ts-ignore
		form: { errors, isDirty: false, isTouched: false, submitCounter: 0 },
		// fieldsGlobal: {  }
		// internalUtils: {},
		// utils: {}
	};
};

interface AllFieldsShape<Fields extends FieldNameValue> {
	fields: {
		[Key in keyof Fields]: FieldShape<Key, Fields[Key]['value']>;
	};
	form: {
		isDirty: boolean;
		isTouched: boolean;
		submitCounter: number;
		errors: {
			fields: { [Key in keyof Fields]: string[] };
			validationCounter: { passed: number; failed: number };
		};
		validate: {
			[Key in keyof Fields]: {
				defaultHandler?(): HandleValidation<Fields[Key]['value']>;
				events: {
					[key in ValidationEvents]?:
						| boolean
						| {
								handler?(): HandleValidation<Fields[Key]['value']>;
								counter: { passed: number; failed: number };
						  };
				};
				counter: { passed: number; failed: number };
			};
		};
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
*/
