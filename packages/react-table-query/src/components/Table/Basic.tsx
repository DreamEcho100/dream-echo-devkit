import {
	forwardRef,
	type HTMLAttributes,
	type ThHTMLAttributes,
	type TdHTMLAttributes,
} from 'react';
import { cx } from '../../utils/internal';

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
	(props, ref) => (
		<table
			ref={ref}
			// className={cx('w-full caption-bottom text-sm', className)}
			{...props}
		/>
	),
);
Table.displayName = 'Table';
// <div className='w-full overflow-auto'>
// </div>

const TableHeader = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => (
	<thead
		ref={ref}
		// className={cx('[&_tr]:border-b', className)}
		{...props}
	/>
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => (
	<tbody
		ref={ref}
		// className={cx('[&_tr:last-child]:border-0', className)}
		{...props}
	/>
));
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef<
	HTMLTableSectionElement,
	HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => (
	<tfoot
		ref={ref}
		// className={cx('bg-primary text-primary-foreground font-medium', className)}
		{...props}
	/>
));
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef<
	HTMLTableRowElement,
	HTMLAttributes<HTMLTableRowElement>
>((props, ref) => (
	<tr
		ref={ref}
		// className={cx(
		// 	'hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors',
		// 	className,
		// )}
		{...props}
	/>
));
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<
	HTMLTableCellElement,
	ThHTMLAttributes<HTMLTableCellElement>
>((props, ref) => (
	<th
		ref={ref}
		// className={cx(
		// 	'text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
		// 	className,
		// )}
		{...props}
	/>
));
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<
	HTMLTableCellElement,
	TdHTMLAttributes<HTMLTableCellElement>
>((props, ref) => <td ref={ref} {...props} />);
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef<
	HTMLTableCaptionElement,
	HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption
		ref={ref}
		className={cx('text-muted-foreground mt-4 text-sm', className)}
		{...props}
	/>
));
TableCaption.displayName = 'TableCaption';

export {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableCell,
	TableCaption,
};
