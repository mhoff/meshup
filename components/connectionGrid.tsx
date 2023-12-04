import { Button, Center, SegmentedControl, Table } from '@mantine/core';
import { useState } from 'react';
import { Icon, Minus, Plus } from 'tabler-icons-react';
import { Member } from '../models/team';
import styles from './ConnectionGrid.module.scss';

interface InteractionMode {
  icon: Icon;
  color: string;
  func: (_: number) => number;
}

const Modes: InteractionMode[] = [
  {
    icon: Plus,
    color: 'green',
    func: (v) => v + 1,
  },
  {
    icon: Minus,
    color: 'red',
    func: (v) => Math.max(0, v - 1),
  },
];

interface ConnectionGridProps {
  members: Member[];
  getWeight: (srcIdx: number, trgIdx: number) => number;
  setWeight?: (srcIdx: number, trgIdx: number, update: (prevWeight: number) => number) => void;
}

export default function ConnectionGrid({ members, getWeight, setWeight }: ConnectionGridProps) {
  const [mode, setMode] = useState<number>(0);

  return (
    <div>
      {members.length > 1 ? (
        <Table
          className={styles.connectionGrid}
          verticalSpacing={4}
          style={{ '& tbody tr td': { borderBottom: 0 }, width: 'auto' }}
          withRowBorders
          withColumnBorders
          // striped={true}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                {setWeight !== undefined && (
                  <Center>
                    <SegmentedControl
                      radius="lg"
                      onChange={(value) => setMode(Number.parseInt(value, 10))}
                      color={Modes[mode].color}
                      data={Modes.map((m, i) => {
                        const ModeIcon = m.icon;
                        return {
                          label: (
                            <Center>
                              <ModeIcon size={16} />
                            </Center>
                          ),
                          value: `${i}`,
                        };
                      })}
                    />
                  </Center>
                )}
              </Table.Th>
              {members.map((member) => (
                <Table.Th key={`col-${member.id}`}>
                  <span>{member.name}</span>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {members.map((rowMember, rowIndex) => (
              <Table.Tr key={`row-${rowMember.id}`}>
                <Table.Td>{rowMember.name}</Table.Td>
                {members.map((colMember, colIndex) => {
                  if (rowIndex <= colIndex) {
                    return <Table.Td aria-label="empty self-connection" key={`${rowMember.id}/${colMember.id}`} />;
                  }
                  return (
                    /* eslint-disable-next-line
                       jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
                    <Table.Td key={`${rowMember.id}/${colMember.id}`}>
                      <Button
                        size="compact-xs"
                        fullWidth
                        variant="outline"
                        onClick={
                          setWeight !== undefined ? () => setWeight(rowIndex, colIndex, Modes[mode].func) : undefined
                        }
                      >
                        {getWeight(rowIndex, colIndex)}
                      </Button>
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        'More team members required.'
      )}
    </div>
  );
}

ConnectionGrid.defaultProps = {
  setWeight: undefined,
};
