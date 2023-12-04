import { ActionIcon, Group, Space, Table, TextInput, Textarea, UnstyledButton } from '@mantine/core';
import * as R from 'ramda';
import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import { ArrowDown, ArrowUp, CornerDownLeft, FileText, Trash } from 'tabler-icons-react';
import { Member, newMember } from '../models/team';

interface MemberListProps {
  members: Member[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
}

export default function MemberList({ members, setMembers }: MemberListProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const [multiline, setMultiline] = useState<boolean>(false);

  const handleNewMemberSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!error && input.length > 0) {
      setMembers([
        ...members,
        ...input
          .split('\n')
          .filter((name) => name.length > 0)
          .map(newMember),
      ]);
      setInput('');
    }
  };

  const handleInput = (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.trim();
    setInput(target.value);
    if (!value.match('^(.*\\S+.*\n)*(.*\\S+.*)$')) {
      setError('Please enter a valid name');
    } else if (target.value.length > 0 && members.some((member) => member.name === value)) {
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
      <Table verticalSpacing={4} style={{ '& tbody tr td': { borderBottom: 0 } }}>
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
          {members.map((member, index) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>
                {index > 0 && (
                  <ActionIcon variant="subtle" size={16} onClick={() => setMembers(R.move(index, index - 1, members))}>
                    <ArrowUp />
                  </ActionIcon>
                )}
              </td>
              <td>
                {index < members.length - 1 && (
                  <ActionIcon variant="subtle" size={16} onClick={() => setMembers(R.move(index, index + 1, members))}>
                    <ArrowDown />
                  </ActionIcon>
                )}
              </td>
              <td>
                <ActionIcon
                  variant="subtle"
                  size={16}
                  onClick={() => setMembers(R.remove(index, 1, members))}
                  aria-label="Delete"
                >
                  <Trash />
                </ActionIcon>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Space h="md" />
      <form onSubmit={handleNewMemberSubmit}>
        {!multiline && (
          <TextInput
            type="text"
            placeholder="Enter new member"
            value={input}
            onChange={handleInput}
            onInvalid={(e) => {
              (e.target as HTMLInputElement).setCustomValidity('');
              e.preventDefault();
            }}
            styles={{
              section: {
                width: '66px',
              },
            }}
            rightSection={
              <Group>
                <UnstyledButton onClick={switchInputMode}>
                  <FileText size={16} />
                </UnstyledButton>
                <UnstyledButton type="submit">
                  <CornerDownLeft size={16} />
                </UnstyledButton>
              </Group>
            }
            error={error.length > 0 ? error : ''}
          />
        )}
        {multiline && (
          <Textarea
            placeholder="Enter new members"
            value={input}
            onChange={handleInput}
            onInvalid={(e) => {
              (e.target as HTMLInputElement).setCustomValidity('');
              e.preventDefault();
            }}
            rightSection={
              <UnstyledButton type="submit">
                <CornerDownLeft size={16} />
              </UnstyledButton>
            }
            error={error.length > 0 ? error : ''}
          />
        )}
      </form>
    </div>
  );
}
