export const cx = (...classesArr: (string | undefined)[]) => {
	let classesStr = '';
	let className: string | undefined;
	for (className of classesArr) {
		if (typeof className === 'string') classesStr += className + ' ';
	}

	return classesStr.trimEnd();
};