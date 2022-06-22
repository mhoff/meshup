import { Title } from '@mantine/core';
import * as React from 'react';
import MemberList from '../components/members';

export default function TeamPage() {
  return (
    <div>
      <Title order={2}>Team Members</Title>
      <p>
        Start here by entering the members of your team.
      </p>
      <MemberList />
    </div>
  );
}
