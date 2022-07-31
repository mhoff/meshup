import { Title } from '@mantine/core';
import * as React from 'react';
import MemberGraph from '../components/memberGraph';
import { useTeamContext } from '../providers/team';

export default function GraphPage() {
  const {
    members, partitions, getWeights,
  } = useTeamContext();

  return (
    <div>
      <Title order={2}>Connection Graph</Title>
      <p>
        This graph visualizes your team with the configured connections strengths.
      </p>
      <MemberGraph getWeights={getWeights} members={members} partitions={partitions} />
    </div>
  );
}
