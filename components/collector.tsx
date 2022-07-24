import { Button } from '@mantine/core';
import * as React from 'react';
import { useCollectorContext } from '../providers/collector';

export default function Collector() {
  const { collectorActive, setCollectorActive, peerId, connectedPeers } = useCollectorContext();

  return (
    <div>
      <span>
        Collector:
        {' '}
        {collectorActive ? 'active' : 'not active'}
        <br />
        {peerId}
        <br />
        {connectedPeers}
      </span>
      <Button onClick={async () => {
        setCollectorActive(true);
      }}
      >
        Collect
      </Button>
    </div>
  );
}
