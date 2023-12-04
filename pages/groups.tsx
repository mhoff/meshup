import { Title } from '@mantine/core';
import { useDeferredValue } from 'react';
import MemberGraph from '../components/memberGraph';
import Pairing from '../components/pairing';
import { useTeamContext } from '../providers/team';

export default function PairingPage() {
  const { members, partitions, setPartitions, getMatrix, getWeights } = useTeamContext();

  const deferred = useDeferredValue({ members, getWeights });

  return (
    <div>
      <Title order={2}>Group Generator</Title>
      <p>
        Select your desired group size and generate all best-scoring matchups (considering the connection strengths).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        <div style={{ width: 400 }}>
          <Title order={4}>Grouping Configuration</Title>
          <Pairing getMatrix={getMatrix} members={members} partitions={partitions} setPartitions={setPartitions} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Title order={4}>Visualization</Title>
          <MemberGraph getWeights={deferred.getWeights} members={deferred.members} partitions={partitions} />
        </div>
      </div>
    </div>
  );
}
