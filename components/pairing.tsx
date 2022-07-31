// import '../styles/globals.css'

import {
  Box,
  Button, InputWrapper, NumberInput, RangeSlider,
} from '@mantine/core';
import { FormEvent, useCallback, useState } from 'react';
import * as React from 'react';
import partition from '../utils/solver';
import { Member } from '../models/collector';

interface PairingProps {
  members: Member[],
  partitions: number[],
  setPartitions: (partitions: number[]) => void,
  getMatrix: () => number[][],
}

export default function Pairing({
  members, partitions, setPartitions, getMatrix,
}: PairingProps) {
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
    setPartitions(await partition(getMatrix(), Math.round(members.length / groupSize)));
    setLoading(false);
  };

  const handleAlternateGroupSizesInput = useCallback((value: [number, number]) => {
    let [lower, upper] = value;
    [lower, upper] = [
      Math.max(Math.min(lower, groupSize), 1),
      Math.min(Math.max(upper, groupSize), members.length - 1),
    ];
    upper = lower === upper ? upper + 1 : upper;
    setAlternateGroupSizes([
      lower, upper,
    ]);
  }, [groupSize, members]);

  React.useEffect(() => {
    handleAlternateGroupSizesInput([groupSize, groupSize + 1]);
  }, [groupSize, handleAlternateGroupSizesInput]);

  return (
    <div>
      {members.length > 1 ? (
        <Box sx={{ maxWidth: 300 }} mx="0">
          <form onSubmit={handleGeneratorSubmit}>
            <NumberInput
              label="Size of pairings"
              defaultValue={2}
              min={2}
              max={members.length}
              onChange={(value) => value !== undefined && setGroupSize(value)}
            />
            <InputWrapper label="Alternate group sizes">
              <RangeSlider
                label={null}
                disabled={members.length % groupSize === 0}
                min={1}
                max={members.length - 1}
                step={1}
                minRange={1}
                marks={new Array(members.length - 1).fill(0).map((_, i) => ({ value: i + 1, label: i + 1 }))}
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
