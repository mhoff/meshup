import { FormEvent, useState } from 'react';
import {
  Table, Space, ActionIcon, TextInput, UnstyledButton, Group, Textarea,
} from '@mantine/core';
import {
  CornerDownLeft, Trash, ArrowUp, ArrowDown, FileText,
} from 'tabler-icons-react';
import * as React from 'react';
import { useTeamContext } from '../providers/team';
import {
  growTeam, shrinkTeam, swapMembers, Team,
} from '../models/team';

export default function MemberList() {
  const { team, setTeam } = useTeamContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const [multiline, setMultiline] = useState<boolean>(false);

  const handleNewMemberSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!error && input.length > 0) {
      setTeam(input.split('\n').filter((name) => name.length > 0).reduce<Team>(growTeam, team));
      setInput('');
    }
  };

  const handleInput = (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.trim();
    setInput(target.value);
    if (!value.match('^(.*\\S+.*\n)*(.*\\S+.*)$')) {
      setError('Please enter a valid name');
    } else if (target.value.length > 0 && team.members.some((member) => member.name === value)) {
      setError('This member already exists');
    } else {
      setError('');
    }
  };

  const switchInputMode = () => {
    setMultiline((prev) => !prev);
    setInput('');
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <Table verticalSpacing={4} sx={{ '& tbody tr td': { borderBottom: 0 } }}>
        <thead>
          <tr>
            <th>Member Name</th>
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <th style={{ width: 16 }} />
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <th style={{ width: 16 }} />
            {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
            <th style={{ width: 16 }} />
          </tr>
        </thead>
        <tbody>
          {team.members.map((member, index) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>
                {index > 0 && (
                <ActionIcon size={16} onClick={() => setTeam(swapMembers(team, index - 1, index))}>
                  <ArrowUp />
                </ActionIcon>
                )}
              </td>
              <td>
                {index < team.size - 1 && (
                <ActionIcon size={16} onClick={() => setTeam(swapMembers(team, index, index + 1))}>
                  <ArrowDown />
                </ActionIcon>
                )}
              </td>
              <td>
                <ActionIcon size={16} onClick={() => setTeam(shrinkTeam(team, index))}>
                  <Trash />
                </ActionIcon>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Space h="md" />
      <form onSubmit={handleNewMemberSubmit}>
        {!multiline
        && (
        <TextInput
          type="text"
          placeholder="Enter new member"
          value={input}
          onChange={handleInput}
          onInvalid={(e) => { (e.target as HTMLInputElement).setCustomValidity(''); e.preventDefault(); }}
          styles={{
            rightSection: {
              width: '66px',
            },
          }}
          rightSection={(
            <Group>
              <UnstyledButton onClick={switchInputMode}><FileText size={16} /></UnstyledButton>
              <UnstyledButton type="submit"><CornerDownLeft size={16} /></UnstyledButton>
            </Group>
          )}
          error={error.length > 0 ? error : ''}
        />
        )}
        {multiline
        && (
        <Textarea
          placeholder="Enter new members"
          value={input}
          onChange={handleInput}
          onInvalid={(e) => { (e.target as HTMLInputElement).setCustomValidity(''); e.preventDefault(); }}
          rightSection={<UnstyledButton type="submit"><CornerDownLeft size={16} /></UnstyledButton>}
          error={error.length > 0 ? error : ''}
        />
        )}
      </form>
    </div>
  );
}
