import { Title } from '@mantine/core';
import * as React from 'react';
import MemberGraph from '../components/memberGraph';

export default function GraphPage() {
  return (
    <div>
      <Title order={2}>Connection Graph</Title>
      <p>
        This graph visualizes your team with the configured connections strengths.
      </p>
      <MemberGraph />
    </div>
  );
}
