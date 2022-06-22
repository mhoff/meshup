import { FormEvent, useState } from 'react';
import {
  Table, Space, ActionIcon, TextInput, UnstyledButton,
} from '@mantine/core';
import {
  CornerDownLeft, Trash, ArrowUp, ArrowDown,
} from 'tabler-icons-react';
import * as React from 'react';
import { useTeamContext } from '../providers/team';
import { growTeam, shrinkTeam, swapMembers } from '../models/team';

export default function MemberList() {
  const { team, setTeam } = useTeamContext();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleNewMemberSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!error && input.length > 0) {
      setTeam(growTeam(team, input));
      setInput('');
    }
  };

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.trim();
    setInput(target.value);
    if (!value.match('^.*\\S+.*$')) {
      setError('Please enter a valid name');
    } else if (target.value.length > 0 && team.members.some((member) => member.name === value)) {
      setError('This member already exists');
    } else {
      setError('');
    }
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
        <TextInput
          type="text"
          placeholder="Enter new member"
          value={input}
          onChange={handleInput}
          onInvalid={(e) => { (e.target as HTMLInputElement).setCustomValidity(''); e.preventDefault(); }}
          rightSection={<UnstyledButton type="submit"><CornerDownLeft size={16} /></UnstyledButton>}
          error={error.length > 0 ? error : ''}
        />
      </form>
    </div>
  );
}
