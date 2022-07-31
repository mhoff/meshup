import { useState } from 'react';
import {
  Table, Center, Button,
} from '@mantine/core';
import { Plus, Minus, Icon } from 'tabler-icons-react';
import * as React from 'react';
import styles from './ConnectionGrid.module.scss';
import {
  Member,
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
  func: (v) => Math.max(0, v - 1),
}];

interface ConnectionGridProps {
  members: Member[],
  getWeight: (srcIdx: number, trgIdx: number) => number,
  setWeight?: (srcIdx: number, trgIdx: number, update: ((prevWeight: number) => number)) => void
}

export default function ConnectionGrid({ members, getWeight, setWeight }: ConnectionGridProps) {
  const [mode, setMode] = useState<number>(0);

  return (
    <div>
      {members.length > 1 ? (
        <Table
          className={styles.connectionGrid}
          verticalSpacing={4}
          sx={{ '& tbody tr td': { borderBottom: 0 }, width: 'auto' }}
        >
          <thead>
            <tr>
              <th>
                {setWeight !== undefined
                && (
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
                )}
              </th>
              {members.map((member, index) => (
                <th key={`col-${member.id}`}>
                  {member.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((rowMember, rowIndex) => (
              <tr key={`row-${rowMember.id}`}>
                <td className={styles.rowHeader}>
                  <Center>
                    {rowMember.name}
                  </Center>
                </td>
                {members.map((colMember, colIndex) => {
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
                        onClick={setWeight !== undefined
                          ? () => setWeight(rowIndex, colIndex, Modes[mode].func)
                          : undefined}
                      >
                        {getWeight(rowIndex, colIndex)}
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

ConnectionGrid.defaultProps = {
  setWeight: undefined,
};
