import type { HTMLProps } from 'react';
// HTMLInputElement

import { useEffect, useRef } from 'react';

function IndeterminateCheckbox({
	indeterminate,
	className = '',
	...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
	const ref = useRef<HTMLInputElement>(null!);

	useEffect(() => {
		if (typeof indeterminate === 'boolean') {
			ref.current.indeterminate = !rest.checked && indeterminate;
		}
	}, [indeterminate, rest.checked]);

	return (
		<input
			type='checkbox'
			ref={ref}
			className={
				className +
				' color cursor-pointer w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
			}
			{...rest}
		/>
	);
}

export default IndeterminateCheckbox;
