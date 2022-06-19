// import '../styles/globals.css'

import {
  Box,
  Button,
  Card, Group, InputWrapper, List, NumberInput, RangeSlider, SimpleGrid, Text,
} from '@mantine/core';
import { FormEvent, useCallback, useState } from 'react';
import * as React from 'react';
import { useTeamContext } from '../providers/team';
import { matchTeam } from '../utils/generator';
import { Member } from '../models/team';

export default function Pairing() {
  const { team } = useTeamContext();
  const [groupSize, setGroupSize] = useState(2);
  const [alternateGroupSizes, setAlternateGroupSizes] = useState<[number, number]>([0, 1]);
  const [pairings, setPairings] = useState<Member[][][]>([]);

  const handleGeneratorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPairings(matchTeam(team.members, team.connectedness, groupSize));
  };

  const handleAlternateGroupSizesInput = useCallback((value: [number, number]) => {
    let [lower, upper] = value;
    [lower, upper] = [
      Math.max(Math.min(lower, groupSize), 0),
      Math.min(Math.max(upper, groupSize), 100),
    ];
    upper = lower === upper ? upper + 1 : upper;
    setAlternateGroupSizes([
      lower, upper,
    ]);
  }, [groupSize]);

  React.useEffect(() => {
    handleAlternateGroupSizesInput([groupSize, groupSize + 1]);
  }, [team, groupSize]);

  return (
    <div>
      <h2>Pairing Generator</h2>
      {team.size > 1 ? (
        <Box sx={{ maxWidth: 300 }} mx="0">
          <form onSubmit={handleGeneratorSubmit}>
            <NumberInput
              label="Size of pairings"
              defaultValue={2}
              min={2}
              max={team.size}
              onChange={(value) => value !== undefined && setGroupSize(value)}
            />
            <InputWrapper label="Alternate group sizes">
              <RangeSlider
                label={null}
                disabled={team.size % groupSize === 0}
                min={1}
                max={team.size - 1}
                step={1}
                minRange={1}
                marks={new Array(team.size - 1).fill(0).map((_, i) => ({ value: i + 1, label: i + 1 }))}
                value={alternateGroupSizes}
                onChange={([lower, upper]) => handleAlternateGroupSizesInput([
                  Number.isNaN(lower) ? alternateGroupSizes[0] : lower,
                  Number.isNaN(upper) ? alternateGroupSizes[1] : upper,
                ])}
                style={{ marginBottom: '30px' }}
              />
            </InputWrapper>

            <Group position="right" mt="md">
              <Button type="submit">Generate</Button>
            </Group>
          </form>
        </Box>
      ) : (
        <p>
          You need to enter more team members to generate meaningful pairings.
        </p>
      )}
      {(pairings.length > 0)
        && (
        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: 980, cols: 3, spacing: 'md' },
            { maxWidth: 755, cols: 2, spacing: 'sm' },
            { maxWidth: 600, cols: 1, spacing: 'sm' },
          ]}
        >
          {pairings.map((pairing, pairingIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <Card key={`pairing-${pairingIndex}`} shadow="sm" p="lg">
              <Text weight={500}>{`Pairing ${pairingIndex + 1}`}</Text>
              <List>
                {pairing.map((pair, pairIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <List.Item key={`pair-${pairIndex}`}>
                    {pair.map((member) => member.name).join(', ')}
                  </List.Item>
                ))}
              </List>
            </Card>
          ))}
        </SimpleGrid>
        )}
    </div>
  );
}
