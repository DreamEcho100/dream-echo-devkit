import type { SVGProps } from 'react';

const IoMdRefresh = (props: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			stroke='currentColor'
			fill='currentColor'
			stroke-width='0'
			viewBox='0 0 512 512'
			height='1em'
			width='1em'
			xmlns='http://www.w3.org/2000/svg'
			{...props}
		>
			<path d='M256 388c-72.597 0-132-59.405-132-132 0-72.601 59.403-132 132-132 36.3 0 69.299 15.4 92.406 39.601L278 234h154V80l-51.698 51.702C348.406 99.798 304.406 80 256 80c-96.797 0-176 79.203-176 176s78.094 176 176 176c81.045 0 148.287-54.134 169.401-128H378.85c-18.745 49.561-67.138 84-122.85 84z'></path>
		</svg>
	);
};

export default IoMdRefresh;