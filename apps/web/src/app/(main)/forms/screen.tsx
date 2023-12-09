'use client';

import FormEcho from './_components/form-echo';
import { ReactHookForm } from './_components/react-hook-form';

// import { Button } from 'ui';

export default function FormsScreen() {
	return (
		<div>
			<h1 className='h-full w-full text-3xl font-bold underline'>
				Hello world!
			</h1>
			<FormEcho />
			<br />
			<hr />
			<hr />
			<hr />
			<br />
			<ReactHookForm />
		</div>
	);
}
