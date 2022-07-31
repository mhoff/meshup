import { Title } from '@mantine/core';
import * as React from 'react';
import Pairing from '../components/pairing';
import { useTeamContext } from '../providers/team';

export default function PairingPage() {
  const {
    members, partitions, setPartitions, getMatrix,
  } = useTeamContext();

  return (
    <div>
      <Title order={2}>Group Generator</Title>
      <p>
        Select your desired group size and generate all best-scoring matchups (considering the connection strengths).
      </p>
      <Pairing getMatrix={getMatrix} members={members} partitions={partitions} setPartitions={setPartitions} />
    </div>
  );
}
