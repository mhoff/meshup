import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '../styles/globals.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import Shell from '../components/shell';
import { TeamProvider } from '../providers/team';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function AppLayout(page: ReactElement) {
  return (
    <TeamProvider>
      <Shell nav>{page}</Shell>
    </TeamProvider>
  );
}

function AppRoot({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? AppLayout;

  return (
    <MantineProvider defaultColorScheme="light">
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {getLayout(<Component {...pageProps} />)}
      <Notifications />
    </MantineProvider>
  );
}

export default AppRoot;
