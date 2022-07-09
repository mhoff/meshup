import { Title } from '@mantine/core';
import * as React from 'react';
import PersistenceControl from '../components/persistence';

export default function PersistencePage() {
  return (
    <div>
      <Title order={2}>Load/Store</Title>
      <p>
        Save and load your teams here.
      </p>
      <PersistenceControl />
    </div>
  );
}
