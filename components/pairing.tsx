// import '../styles/globals.css'

import {
  Box,
  Button,
  Card, Divider, InputWrapper, List, NumberInput, RangeSlider, SimpleGrid, Text,
} from '@mantine/core';
import { FormEvent, useCallback, useState } from 'react';
import * as React from 'react';
import { useTeamContext } from '../providers/team';
import { MatchResult, matchTeam } from '../utils/generator';
import { Member } from '../models/team';

export default function Pairing() {
  const { team } = useTeamContext();
  const [groupSize, setGroupSize] = useState(2);
  const [alternateGroupSizes, setAlternateGroupSizes] = useState<[number, number]>([0, 1]);
  const [matches, setMatches] = useState<MatchResult<Member>[]>([]);

  const handleGeneratorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [lower, upper] = alternateGroupSizes;
    setMatches(matchTeam<Member>(
      team.members,
      team.connectedness,
      groupSize,
      new Array(upper - lower + 1).fill(0).map((_, i) => lower + i),
    ));
  };

  const handleAlternateGroupSizesInput = useCallback((value: [number, number]) => {
    let [lower, upper] = value;
    [lower, upper] = [
      Math.max(Math.min(lower, groupSize), 1),
      Math.min(Math.max(upper, groupSize), team.size - 1),
    ];
    upper = lower === upper ? upper + 1 : upper;
    setAlternateGroupSizes([
      lower, upper,
    ]);
  }, [groupSize]);

  React.useEffect(() => {
    handleAlternateGroupSizesInput([groupSize, groupSize + 1]);
  }, [team, groupSize, handleAlternateGroupSizesInput]);

  return (
    <div>
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

            <Button type="submit" fullWidth>Generate</Button>
          </form>
        </Box>
      ) : (
        <p>
          You need to enter more team members to generate meaningful pairings.
        </p>
      )}
      {(matches.length > 0) && (
        <Divider my="xs" label={`Showing ${matches.length} results`} labelPosition="center" />
      )}
      {(matches.length > 0 && matches.length < 1000)
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
          {matches.map((match, matchIndex) => (
            // eslint-disable-next-line react/no-array-index-key
            <Card key={`pairing-${match.id}`} shadow="sm" p="lg">
              <Text weight={500}>{`Pairing ${matchIndex + 1}`}</Text>
              <List>
                {match.pairings.map((pair, pairIndex) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <List.Item key={`group-${pairIndex}`}>
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
