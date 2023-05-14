import {
	type HTMLAttributes,
	type ThHTMLAttributes,
	type TdHTMLAttributes,
	type HTMLProps,
	useEffect,
	useRef,
} from 'react';
import { useStore, type StoreApi } from 'zustand';
import { type TableStore } from '../../utils/types';

const Table = <TData,>({
	store,
	...props
}: HTMLAttributes<HTMLTableElement> & {
	store: StoreApi<TableStore<TData>>;
}) => {
	const className = useStore(store, (store) => store.classNames?.table);

	return (
		<table
			// className={cx('w-full caption-bottom text-sm', className)}
			{...props}
			className={className}
		/>
	);
};

// <div className='w-full overflow-auto'>
// </div>

const TableHeader = (props: HTMLAttributes<HTMLTableSectionElement>) => (
	<thead
		// className={cx('[&_tr]:border-b', className)}
		{...props}
	/>
);

const TableBody = (props: HTMLAttributes<HTMLTableSectionElement>) => (
	<tbody
		// className={cx('[&_tr:last-child]:border-0', className)}
		{...props}
	/>
);

const TableFooter = (props: HTMLAttributes<HTMLTableSectionElement>) => (
	<tfoot
		// className={cx('bg-primary text-primary-foreground font-medium', className)}
		{...props}
	/>
);

const TableRow = (props: HTMLAttributes<HTMLTableRowElement>) => (
	<tr
		// className={cx(
		// 	'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
		// 	className,
		// )}
		{...props}
	/>
);

const TableHead = (props: ThHTMLAttributes<HTMLTableCellElement>) => (
	<th
		// className={cx(
		// 	'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
		// 	className,
		// )}
		{...props}
	/>
);

const TableCell = (props: TdHTMLAttributes<HTMLTableCellElement>) => (
	<td {...props} />
);

const IndeterminateCheckbox = <TData,>({
	indeterminate,
	store,
	tContainerType,
	...props
}: {
	indeterminate?: boolean;
	tContainerType: 'thead' | 'tbody';
	store: StoreApi<TableStore<TData>>;
} & HTMLProps<HTMLInputElement>) => {
	const selectCheckBoxContainerClassName = useStore(store, (store) =>
		tContainerType === 'thead'
			? store.classNames?.thead?.th?.selectCheckBoxContainer
			: store.classNames?.tbody?.td?.selectCheckBoxContainer,
	);
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		if (typeof indeterminate === 'boolean') {
			ref.current.indeterminate = !props.checked && indeterminate;
		}
	}, [indeterminate, props.checked]);

	return (
		<div className={selectCheckBoxContainerClassName?._}>
			<input
				type='checkbox'
				ref={ref}
				className={selectCheckBoxContainerClassName?.checkbox}
				{...props}
			/>
		</div>
	);
};

// const TableCaption = forwardRef<
// 	HTMLTableCaptionElement,
// 	HTMLAttributes<HTMLTableCaptionElement>
// >(({ className, ...props }, ref) => (
// 	<caption
// 		ref={ref}
// 		className={cx('text-muted-foreground mt-4 text-sm', className)}
// 		{...props}
// 	/>
// ));
// TableCaption.displayName = 'TableCaption';

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	IndeterminateCheckbox,
};
