import { SimpleGrid, Title } from '@mantine/core';
import * as React from 'react';
import ConnectionGrid from '../components/connectionGrid';
import MemberGraph from '../components/memberGraph';

export default function ConnectionsPage() {
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
      <SimpleGrid
        cols={2}
        spacing="lg"
        breakpoints={[
          { maxWidth: 930, cols: 1, spacing: 'lg' },
        ]}
      >
        <div>
          <Title order={4}>Team Members</Title>
          <ConnectionGrid />
        </div>
        <div>
          <Title order={4}>Visualization</Title>
          <MemberGraph />
        </div>
      </SimpleGrid>
    </div>
  );
}
