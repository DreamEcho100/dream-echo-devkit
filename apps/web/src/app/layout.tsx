import type { PropsWithChildren } from 'react';
import Providers from '~/libs/providers';

import '~/styles/globals.css';

export default function Layout(props: PropsWithChildren) {
	return (
		<html lang='en'>
			<body suppressHydrationWarning>
				<Providers>{props.children}</Providers>
			</body>
		</html>
	);
}
