// import '../styles/globals.css'

import {
  Box,
  Button, InputWrapper, NumberInput, RangeSlider,
} from '@mantine/core';
import { FormEvent, useCallback, useState } from 'react';
import * as React from 'react';
import { useTeamContext } from '../providers/team';
// import usePartitioner from '../pages/_app.hooks';
// import { PartitioningRequest, PartitioningResponse } from '../interfaces/generator';
import partition from '../utils/solver';

export default function Pairing() {
  const {
    team, members, partitions, setPartitions,
  } = useTeamContext();
  const [groupSize, setGroupSize] = useState(2);
  const [alternateGroupSizes, setAlternateGroupSizes] = useState<[number, number]>([0, 1]);
  const [loading, setLoading] = useState<Boolean>(false);

  // const setPartitioningRequest = usePartitioner((resp: any) => {
  //   setLoading(false);
  //   setPartitioning((resp.data as PartitioningResponse).partitions);
  // });

  const handleGeneratorSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const [lower, upper] = alternateGroupSizes;
    // const req: PartitioningRequest = {
    //   connectedness: team.connectedness,
    //   groupSize,
    //   alternateGroupSizes: [], // new Array(upper - lower + 1).fill(0).map((_, i) => lower + i),
    // };
    setLoading(true);
    // setPartitioningRequest(req);
    setPartitions(await partition(team.connectedness, Math.round(team.size / groupSize)));
    setLoading(false);
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
      {(loading) && (
        <span>Loading...</span>
      )}
      {(partitions.length > 0) && (
        <ul>
          {[...new Set(partitions)].map((p) => (
            <li key={p}>
              {
                partitions
                  .map((p2, i) => [p2, i])
                  .filter(([p2, _]) => p2 === p)
                  .map(([_, i]) => members[i].name)
                  .join(', ')
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
