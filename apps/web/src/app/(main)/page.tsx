import Link from 'next/link';

export default function HomePage() {
	return (
		<section>
			<h1>HomePage</h1>
			<ul>
				<li>
					<Link href='/forms'>forms</Link>
				</li>
				<li>
					<Link href='/react-table-query'>react-table-query</Link>
				</li>
			</ul>
		</section>
	);
}
