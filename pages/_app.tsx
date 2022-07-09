import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import { NotificationsProvider } from '@mantine/notifications';
import { TeamProvider } from '../providers/team';
import Shell from '../components/shell';

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
      <NotificationsProvider>
        <TeamProvider>
          <Shell>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Component {...pageProps} />
          </Shell>
        </TeamProvider>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default MyApp;
