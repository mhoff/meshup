import { Title } from '@mantine/core';
import * as React from 'react';
import { useDeferredValue } from 'react';
import ConnectionGrid from '../components/connectionGrid';
import MemberGraph from '../components/memberGraph';
import { useTeamContext } from '../providers/team';

export default function ConnectionsPage() {
  const {
    members, partitions, getWeight, getWeights, setWeight,
  } = useTeamContext();

  const deferred = useDeferredValue({ members, getWeights });

  return (
    <div>
      <Title order={2}>Team Connections</Title>
      <p>
        Optional Step; adapt the below matrix to, e.g.,
        represent how well your team members already know each other individually.
        A high connection weight makes it _unlikely_ for members to end up in the same group.
        <br />
        Connection strengths can be adjusted by clicking on the individual cells.
        The icon in the top left indicates whether the click will produce an increment (+)
        or a decrement (-).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        <div style={{ maxWidth: '100%' }}>
          <Title order={4}>Team Members</Title>
          <div style={{ overflow: 'auto' }}>
            <ConnectionGrid members={members} getWeight={getWeight} setWeight={setWeight} />
          </div>
        </div>
        <div style={{ flexGrow: 1 }}>
          <Title order={4}>Visualization</Title>
          <MemberGraph getWeights={deferred.getWeights} members={deferred.members} partitions={partitions} />
        </div>
      </div>
    </div>
  );
}
