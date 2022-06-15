import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { TeamProvider } from '../providers/team'
import { MantineProvider } from '@mantine/core';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        /** Put your mantine theme override here */
        colorScheme: 'light',
      }}
    >
      <TeamProvider>
        <Component {...pageProps} />
      </TeamProvider>
    </MantineProvider>
  );
}

export default MyApp
