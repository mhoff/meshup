import { ActionIcon } from '@mantine/core';
import * as React from 'react';
import { Clipboard } from 'tabler-icons-react';
import { CollectorStateServer, NetworkState } from '../utils/collector';

export default function CollectorStatus({ state }: { state: CollectorStateServer }) {
  const { networkState, peerId, connections } = state;

  const clientUrl = `${window.location.protocol}//`
    + `${window.location.hostname}:${window.location.port}`
    + `/client?peerId=${peerId}`;

  return (
    <div>
      Polling server status:
      {' '}
      {NetworkState[networkState]}
      {networkState === NetworkState.CONNECTED
        && ` (${connections} connections)`}
      <br />
      Member link:
      {' '}
      {(window !== undefined)
      && (
        <span>
          {clientUrl}
          <ActionIcon style={{ display: 'inline' }} onClick={() => navigator.clipboard.writeText(clientUrl)} size={20}>
            <Clipboard />
          </ActionIcon>
        </span>
      )}
    </div>
  );
}
