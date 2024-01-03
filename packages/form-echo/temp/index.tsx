type FalsyValues = undefined | null | false | 0 | '';
type OnFalsyDefaultReturn<Value, DefaultValue> = Value extends FalsyValues
	? DefaultValue
	: NonNullable<Value>;
type OnNullableDefaultReturn<Value, DefaultValue> = Value extends null
	? DefaultValue
	: NonNullable<Value>;
function onFalsyDefault<DefaultValue>(defaultValue: DefaultValue) {
	return <Value,>(value: Value) =>
		(!value ? defaultValue : value) as OnFalsyDefaultReturn<
			Value,
			DefaultValue
		>;
}

const formHelpers = {
	onFalsy: {
		emptyString: onFalsyDefault('' as const),
		undefined: onFalsyDefault(undefined),
		null: onFalsyDefault(null),
		default: onFalsyDefault,
	},
	onNullable: {
		emptyString: <Value,>(value: Value) =>
			(value ?? '') as OnNullableDefaultReturn<Value, ''>,
		undefined: <Value,>(value: Value) =>
			(value ?? undefined) as OnNullableDefaultReturn<Value, undefined>,
		null: <Value,>(value: Value) =>
			(value ?? null) as OnNullableDefaultReturn<Value, null>,
		default:
			<DefaultValue,>(defaultValue: DefaultValue) =>
			<Value,>(value: Value): OnNullableDefaultReturn<Value, DefaultValue> => {
				const symbol = Symbol();
				const isNullable = value ?? symbol;

				if (isNullable === symbol) {
					return defaultValue as OnNullableDefaultReturn<Value, DefaultValue>;
				}

				return value as OnNullableDefaultReturn<Value, DefaultValue>;
			},
	},
};

const test_1 = [1, 2, 3] as const;
const result_1 = {
	default: formHelpers.onFalsy.default('lol')(test_1),
	emptyString: formHelpers.onFalsy.emptyString(test_1),
	null: formHelpers.onFalsy.null(test_1),
	undefined: formHelpers.onFalsy.undefined(test_1),
};
result_1;

const test_1_2 = 0;
const result_1_2 = {
	default: formHelpers.onFalsy.default('lol')(test_1_2),
	emptyString: formHelpers.onFalsy.emptyString(test_1_2),
	null: formHelpers.onFalsy.null(test_1_2),
	undefined: formHelpers.onFalsy.undefined(test_1_2),
};
result_1_2;

const test_2 = [1, 2, 3] as const;
const result_2 = {
	default: formHelpers.onNullable.default('lol' as const)(test_2),
	emptyString: formHelpers.onNullable.emptyString(test_2),
	null: formHelpers.onNullable.null(test_2),
	undefined: formHelpers.onNullable.undefined(test_2),
};
result_2;

const test_2_2 = null;
const result_2_2 = {
	default: formHelpers.onNullable.default('lol' as const)(test_2_2),
	emptyString: formHelpers.onNullable.emptyString(test_2_2),
	null: formHelpers.onNullable.null(test_2_2),
	undefined: formHelpers.onNullable.undefined(test_2_2),
};
result_2_2;

/* */
/* */
/* */

class UtilsOn {
	static undefined<Item, TrueValue, FalseValue>(
		trueCb: TrueValue,
		falseCb: FalseValue | ((item: Item) => FalseValue),
	) {
		return (item: Item) => {
			return typeof item === 'undefined'
				? trueCb
				: typeof falseCb === 'function'
				? (falseCb as (item: Item) => FalseValue)(item)
				: falseCb;
		};
	}
	static null<Item, TrueValue, FalseValue>(
		trueCb: TrueValue,
		falseCb: FalseValue | ((item: Item) => FalseValue),
	) {
		return (item: Item) => {
			return typeof item === 'object' && !item
				? trueCb
				: typeof falseCb === 'function'
				? (falseCb as (item: Item) => FalseValue)(item)
				: falseCb;
		};
	}
	static number<Item, TrueValue, FalseValue>(
		trueCb: TrueValue,
		falseCb: FalseValue | ((item: Item) => FalseValue),
	) {
		return (item: Item) => {
			return typeof item === 'number'
				? trueCb
				: typeof falseCb === 'function'
				? (falseCb as (item: Item) => FalseValue)(item)
				: falseCb;
		};
	}
	static string<Item, TrueValue, FalseValue>(
		trueCb: TrueValue,
		falseCb: FalseValue | ((item: Item) => FalseValue),
	) {
		return (item: Item) => {
			return typeof item === 'string'
				? trueCb
				: typeof falseCb === 'function'
				? (falseCb as (item: Item) => FalseValue)(item)
				: falseCb;
		};
	}
}

class Utils {
	static on = UtilsOn;
	static falsyTo<Item, ValueIfFalse>() {
		return (item: Item, value: ValueIfFalse) => (!item ? value : item);
	}
	static falsyToNull<Item>() {
		return (item: Item) => (!item ? null : item);
	}
	static falsyToUndefined<Item>() {
		return (item: Item) => (!item ? undefined : item);
	}
}
const test: number | undefined = 9;
const utils = Utils;
const result = utils.on.undefined('lol', 'bruh')(test);
result;

// import { z } from 'zod';
// import type { FormHTMLAttributes } from 'react';

// import type {
// 	CreateCreateFormStore,
// 	FormStoreApi,
// 	HandlePreSubmitCB,
// 	HandleValidation,
// } from '../src/old';
// import { createFormStore, useFormStore } from '../src/old/utils';

// const ee = {} as CreateCreateFormStore<
// 	{
// 		username: string | undefined;
// 		age: number;
// 	},
// 	{
// 		username: HandleValidation<number>; // (value: string | undefined) => number;
// 	}
// >;

// ee.controls.username.value;
// ee.controls.username.validations.handler;

// const eee = createFormStore({
// 	initialValues: {
// 		username: undefined,
// 		age: 0,
// 	},
// 	validationSchema: {
// 		username: z.string(),
// 		age: z.number(),
// 	},
// });

// eee.getState().controls.username.value;
// eee.getState().controls.username.validations.handler;

// const Comp = () => {
// 	const username = useFormStore(eee, (store) => store.controls.username);

// 	if (typeof username !== 'string') username;
// 	if (typeof username === 'string') username;

// 	return (
// 		<>
// 			<Form
// 				store={eee}
// 				handlePreSubmitCB={(event, { values, validatedValues }) => {
// 					event.preventDefault();
// 					values.username;
// 					validatedValues.username;
// 					return;
// 				}}
// 			/>
// 			<Form2
// 				store={eee}
// 				handleOnSubmit={(event, { values, validatedValues }) => {
// 					event.preventDefault();
// 					values.username;
// 					validatedValues.username;
// 					return;
// 				}}
// 			/>
// 		</>
// 	);
// };

// const Form = <Controls extends Record<string, unknown>, ValidatedControls>({
// 	store,
// }: {
// 	store: FormStoreApi<Controls, ValidatedControls>;
// 	handlePreSubmitCB: HandlePreSubmitCB<Controls, ValidatedControls>;
// }) => {
// 	store.getState().controls.sa.errors;
// 	return <></>;
// };

// Comp;

// /*
// type GetStoreControlsValues<
//   Store extends FormStoreApi<any, any>
// > = {
//   [Key in keyof ReturnType<Store["getState"]>["controls"]]: ReturnType<
//     Store["getState"]
//   >["controls"][Key]["value"];
// };
// type GetStoreValidatedControlsValues<
//   Store extends FormStoreApi<any, any>
// > = {
//   [Key in keyof ReturnType<Store["getState"]>["controls"]]: ReturnType<
//     Store["getState"]
//   >["controls"][Key]["validations"] extends ControlValidation<any>
//     ? ReturnType<Store["getState"]>["controls"][Key]["validations"]["handler"]
//     : never;
// };

// export type FormProps<
//   Store extends FormStoreApi<any, any>
// > = FormHTMLAttributes<HTMLFormElement> & {
//   store: Store;
//   handleOnSubmit?: HandlePreSubmitCB<
//     GetStoreControlsValues<Store>,
//     GetStoreValidatedControlsValues<Store>
//   >;
// };
// */

// export type FormProps<
// 	Controls extends Record<string, unknown>,
// 	ValidatedControls,
// > = FormHTMLAttributes<HTMLFormElement> & {
// 	store: FormStoreApi<Controls, ValidatedControls>;
// 	handleOnSubmit?: HandlePreSubmitCB<Controls, ValidatedControls>;
// };

// const Form2 = <Controls extends Record<string, unknown>, ValidatedControls>({
// 	store,
// 	handleOnSubmit,
// 	...props
// }: FormProps<Controls, ValidatedControls>) => {
// 	const handlePreSubmit = useFormStore(
// 		store,
// 		(state) => state.handlePreSubmit,
// 	);

// 	return <form onSubmit={handlePreSubmit(handleOnSubmit)} {...props} />;
// };

// Form2;

// const validationSchemaSchema = {
// 	username: z.string(), //.optional(),
// 	age: (val: unknown) => z.number().parse(val),
// };

// const t = createFormStore({
// 	initialValues: { username: null, age: '0' } as {
// 		username?: null | string;
// 		age: string;
// 	},
// 	validationSchema: validationSchemaSchema,
// });

// t.getState().handlePreSubmit((_event, { validatedValues, values }) => {
// 	validatedValues.username;
// 	validatedValues.age;
// 	values;
// });

// t.getState().controls.username.value;
// t.getState().controls.username.validations.handler;

// t.getState().controls.age.value;
// t.getState().controls.age.validations.handler;

// type IV = { username: null | string; age: string };

// type FF = CreateCreateFormStore<IV, typeof validationSchemaSchema>;

// const tt = {} as FF;

// // tt.___?.username;
// // tt._?.username;

// tt.controls.username.value;
// tt.controls.username.validations.handler;
// type _ttUsername = typeof tt.controls.username.validations.handler;
// const rUsername = tt.controls.username.validations.handler('', 'change');
// rUsername;

// tt.controls.age.value;
// tt.controls.age.validations.handler;
// type _ttAge = ReturnType<typeof tt.controls.age.validations.handler>;
// const rAge = tt.controls.age.validations.handler('', 'change');
// rAge;
