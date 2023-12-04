import { Title } from '@mantine/core';
import MemberList from '../components/members';
import { useTeamContext } from '../providers/team';

export default function TeamPage() {
  const { members, setMembers } = useTeamContext();

  return (
    <div style={{ maxWidth: 600 }}>
      <Title order={2}>Team Members</Title>
      <p>Start here by entering the members of your team.</p>
      <MemberList members={members} setMembers={setMembers} />
    </div>
  );
}
