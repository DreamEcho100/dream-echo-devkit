import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import '~/styles/globals.css';

const FIVE_MINUTES_IN_MILLE_SECONDS = 1000 * 60 * 60 * 5000;

const queryClient = new QueryClient({
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
});

const MyApp = ({ Component, pageProps }: AppProps) => {
	return (
		<QueryClientProvider client={queryClient}>
			<Component {...pageProps} />
		</QueryClientProvider>
	);
};

export default MyApp;
