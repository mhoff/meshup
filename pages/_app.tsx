import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import { NotificationsProvider } from '@mantine/notifications';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
import { TeamProvider } from '../providers/team';
import Shell from '../components/shell';
import { CollectorProvider } from '../providers/collector';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function AppLayout(page: ReactElement) {
  return (
    <TeamProvider>
      <CollectorProvider>
        <Shell nav>
          {page}
        </Shell>
      </CollectorProvider>
    </TeamProvider>
  );
}

function AppRoot({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? AppLayout;

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
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        {getLayout(<Component {...pageProps} />)}
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default AppRoot;
