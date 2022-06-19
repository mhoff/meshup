// import '../styles/globals.css'

import { useState } from 'react';
import {
  Table, ActionIcon, Center,
} from '@mantine/core';
import { Plus, Minus, Icon } from 'tabler-icons-react';
import * as React from 'react';
import { useTeamContext } from '../providers/team';
import {
  getConnection, updateConnectedness,
} from '../models/team';

interface InteractionMode {
  icon: Icon,
  func: (_: number) => number
}

const Modes: InteractionMode[] = [{
  icon: Plus,
  func: (v) => v + 1,
}, {
  icon: Minus,
  func: (v) => v - 1,
}];

export default function ConnectionGrid() {
  const { team, setTeam } = useTeamContext();
  const [mode, setMode] = useState<number>(0);

  return (
    <div style={{ maxWidth: '400px' }}>
      <h2>Team Connectedness</h2>
      {team.size > 1 ? (
        <Table verticalSpacing={4} sx={{ '& tbody tr td': { borderBottom: 0 } }}>
          <thead>
            <tr>
              <th>
                <Center>
                  <ActionIcon size={16} onClick={() => setMode((mode + 1) % Modes.length)}>
                    {(() => {
                      // TODO improve syntax
                      const ModeIcon = Modes[mode].icon;
                      return (<ModeIcon />);
                    })()}
                  </ActionIcon>
                </Center>
              </th>
              {team.members.map((member, index) => (
                <th key={`col-${member.id}`}>{member.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.members.map((rowMember, rowIndex) => (
              <tr key={`row-${rowMember.id}`}>
                <td>{rowMember.name}</td>
                {team.members.map((colMember, colIndex) => {
                  if (rowIndex === colIndex) {
                    return <td key={`${rowMember.id}/${colMember.id}`} />;
                  }
                  return (
                    /* eslint-disable-next-line
                       jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
                    <td
                      key={`${rowMember.id}/${colMember.id}`}
                      onClick={(e) => setTeam(updateConnectedness(team, rowIndex, colIndex, Modes[mode].func))}
                    >
                      {getConnection(team, rowIndex, colIndex)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : 'More team members required.'}
    </div>
  );
}
