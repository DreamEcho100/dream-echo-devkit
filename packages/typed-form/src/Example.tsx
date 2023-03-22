import { z } from 'zod';
import { Form } from './UI';
import { createFormStore } from './utils';

const formStore = createFormStore({
	shared: {
		validateOnChange: true,
		validateOnSubmit: true,
	},
	fields: {
		name: {
			value: '',
			handleValidation: (value) => z.string().parse(value),
		},
		age: {
			value: 0,
			handleValidation: (value) => z.number().parse(value),
		},
	},
});

const Example = () => {
	return <Form store={formStore} handleOnSubmit={({ values }) => {}}></Form>;
};

export default Example;
