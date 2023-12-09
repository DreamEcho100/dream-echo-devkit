'use client';

import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const FIVE_MINUTES_IN_MILLE_SECONDS = 1000 * 60 * 60 * 5000;

function ReactQueryProviders(props: PropsWithChildren) {
	const [queryClient] = useState(
		new QueryClient({
			defaultOptions: {
				queries: {
					retry(failureCounts, error) {
						const errorStatusCode = (error as { status: number })?.status;
						if (errorStatusCode === 404 || errorStatusCode >= 500) return false;
						return failureCounts < 3 + 1;
					},
					refetchInterval: FIVE_MINUTES_IN_MILLE_SECONDS,
					refetchOnWindowFocus: false,
					refetchIntervalInBackground: false,
					cacheTime: FIVE_MINUTES_IN_MILLE_SECONDS,
				},
			},
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
			{/* @ts-ignore */}
			{props.children!}
		</QueryClientProvider>
	);
}

export default function Providers(props: PropsWithChildren) {
	return <ReactQueryProviders>{props.children}</ReactQueryProviders>;
}
