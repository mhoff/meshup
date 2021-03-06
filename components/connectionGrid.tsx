import { useState } from 'react';
import {
  Table, Center, Button,
} from '@mantine/core';
import { Plus, Minus, Icon } from 'tabler-icons-react';
import * as React from 'react';
import styles from './ConnectionGrid.module.scss';
import { useTeamContext } from '../providers/team';
import {
  getConnection, updateConnectedness,
} from '../models/team';

interface InteractionMode {
  icon: Icon,
  color: string,
  func: (_: number) => number
}

const Modes: InteractionMode[] = [{
  icon: Plus,
  color: 'green',
  func: (v) => v + 1,
}, {
  icon: Minus,
  color: 'red',
  func: (v) => v - 1,
}];

export default function ConnectionGrid() {
  const { team, setTeam } = useTeamContext();
  const [mode, setMode] = useState<number>(0);

  return (
    <div>
      {team.size > 1 ? (
        <Table
          className={styles.connectionGrid}
          verticalSpacing={4}
          sx={{ '& tbody tr td': { borderBottom: 0 }, width: 'auto' }}
        >
          <thead>
            <tr>
              <th>
                <Center>
                  <Button
                    compact
                    onClick={() => setMode((mode + 1) % Modes.length)}
                    color={Modes[mode].color}
                  >
                    {(() => {
                      const ModeIcon = Modes[mode].icon;
                      return (<ModeIcon size={16} />);
                    })()}
                  </Button>
                </Center>
              </th>
              {team.members.map((member, index) => (
                <th key={`col-${member.id}`}>
                  {member.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.members.map((rowMember, rowIndex) => (
              <tr key={`row-${rowMember.id}`}>
                <td className={styles.rowHeader}>
                  <Center>
                    {rowMember.name}
                  </Center>
                </td>
                {team.members.map((colMember, colIndex) => {
                  if (rowIndex === colIndex) {
                    return <td key={`${rowMember.id}/${colMember.id}`} />;
                  }
                  return (
                    /* eslint-disable-next-line
                       jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
                    <td
                      key={`${rowMember.id}/${colMember.id}`}
                    >
                      <Button
                        compact
                        fullWidth
                        variant="outline"
                        onClick={() => setTeam(updateConnectedness(team, rowIndex, colIndex, Modes[mode].func))}
                      >
                        {getConnection(team, rowIndex, colIndex)}
                      </Button>
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
