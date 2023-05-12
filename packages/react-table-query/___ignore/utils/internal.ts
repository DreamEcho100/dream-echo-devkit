export const cx = (...classesArr: (string | undefined)[]) => {
	let classesStr = '';
	let className: string | undefined;
	for (className of classesArr) {
		if (typeof className === 'string') classesStr += className + ' ';
	}

	return classesStr.trimEnd();
};

/*
function flattenArray<T>(arr: T[]): T[] {
  const flattened: T[] = [];
  let i = 0;

  while (i < arr.length) {
    const item = arr[i];
    if (Array.isArray(item)) {
      arr.splice(i, 1, ...item);
      i--;
    } else {
      flattened.push(item);
    }
    i++;
  }

  return flattened;
}
*/
