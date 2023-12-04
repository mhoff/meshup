// import '../styles/globals.css'

import { Box, Button, InputWrapper, RangeSlider } from '@mantine/core';
import * as R from 'ramda';
import * as React from 'react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { Member } from '../models/collector';
import partition from '../utils/solver';
import styles from './Pairing.module.scss';

interface PairingProps {
  members: Member[];
  partitions: number[];
  setPartitions: (partitions: number[]) => void;
  getMatrix: () => number[][];
}

export default function Pairing({ members, partitions, setPartitions, getMatrix }: PairingProps) {
  const [groupCounts, setGroupCounts] = useState<[number, number]>([0, 0]);
  const [userGroupSizes, setUserGroupSizes] = useState<[number, number] | undefined>();
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<Boolean>(false);

  const groupSizeConf = React.useMemo(() => {
    const min = Math.max(...[1, Math.floor(members.length / groupCounts[1])].filter(Number.isFinite));
    const max = Math.min(...[members.length, Math.ceil(members.length / groupCounts[0])].filter(Number.isFinite));
    return {
      min,
      max,
      marks: R.range(min, max + 1).map((i) => ({ value: i, label: i })),
    };
  }, [members, groupCounts]);

  const groupSizes = useMemo(
    () => userGroupSizes || [groupSizeConf.min, groupSizeConf.max],
    [userGroupSizes, groupSizeConf]
  ) as [number, number];

  const isGroupCountValid = useCallback(
    (count: number) => {
      const [minSize, maxSize] = groupSizes;
      return count * minSize <= members.length && count * maxSize >= members.length;
    },
    [members, groupSizes]
  );

  const validGroupCounts = useMemo(
    () => R.range(groupCounts[0], groupCounts[1] + 1).filter(isGroupCountValid),
    [groupCounts, isGroupCountValid]
  );

  const handleGeneratorSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [minSize, maxSize] = groupSizes;

    setLoading(true);
    setInputError(undefined);
    const partitionResult = await partition(getMatrix(), validGroupCounts, minSize, maxSize);
    if (partitionResult === null) {
      setInputError(
        'Mesh:up failed to compute a result using the given parameterization. This does not imply there is none.'
      );
    } else {
      setPartitions(partitionResult);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    setGroupCounts(([prevMin, prevMax]) => (prevMax === 0 ? [1, members.length] : [prevMin, prevMax]));
  }, [members]);

  const groupCountConf = React.useMemo(
    () => ({
      min: 1,
      max: members.length,
      marks: R.range(1, members.length + 1).map((i) => ({
        value: i,
        label: (
          <span className={isGroupCountValid(i) || i < groupCounts[0] || i > groupCounts[1] ? '' : styles.illegalMark}>
            {i}
          </span>
        ),
      })),
    }),
    [members, isGroupCountValid, groupCounts]
  );

  React.useEffect(() => {
    setUserGroupSizes(
      (prevSizes) =>
        prevSizes === undefined
          ? undefined // init range
          : [
              Math.max(groupSizeConf.min, Math.min(prevSizes[0], groupSizeConf.max)),
              Math.min(groupSizeConf.max, Math.max(prevSizes[1], groupSizeConf.min)),
            ] // update boundaries
    );
  }, [groupSizeConf]);

  const partitionedMembers = useMemo(() => {
    if (partitions.length > 0) {
      return [...new Set(partitions)].map((p) => ({
        partition: p,
        members: partitions
          .map((p2, i) => ({ group: p2, member: members[i] }))
          .filter(({ group }) => group === p)
          .map(({ member }) => member),
      }));
    }
    return undefined;
  }, [partitions, members]);

  return (
    <div className={styles.pairing}>
      {members.length > 1 ? (
        <Box style={{ maxWidth: 300 }} mx="0">
          <form onSubmit={handleGeneratorSubmit}>
            <InputWrapper label={`Number of groups: ${groupCounts[0]} - ${groupCounts[1]}`}>
              <RangeSlider
                label={null}
                step={1}
                minRange={0}
                min={groupCountConf.min}
                max={groupCountConf.max}
                marks={groupCountConf.marks}
                value={groupCounts}
                onChange={setGroupCounts}
                style={{ marginBottom: '40px' }}
              />
            </InputWrapper>
            <InputWrapper label={`Desired group sizes: ${groupSizes[0]} - ${groupSizes[1]}`}>
              <RangeSlider
                label={null}
                step={1}
                minRange={0}
                min={groupSizeConf.min}
                max={groupSizeConf.max}
                marks={groupSizeConf.marks}
                value={groupSizes}
                onChange={setUserGroupSizes}
                style={{ marginBottom: '40px' }}
              />
            </InputWrapper>
            {R.range(groupCounts[0], groupCounts[1] + 1).some(R.complement(isGroupCountValid)) && (
              <>
                <div style={{ fontSize: 10 }}>
                  Group counts indicated in <span className={styles.illegalMark}>red</span> are not feasible given the
                  selected group sizes. These group counts will be ignored.
                </div>
                <br />
              </>
            )}
            <br />
            <Button type="submit" fullWidth disabled={validGroupCounts.length === 0}>
              Generate
            </Button>
          </form>
        </Box>
      ) : (
        <p>You need to enter more team members to generate meaningful pairings.</p>
      )}
      {inputError && <div>{inputError}</div>}
      {loading && <span>Loading...</span>}
      {partitionedMembers && (
        <ul>
          {partitionedMembers.map(({ members, partition }) => (
            <li key={partition}>{members.map((m) => m.name).join(', ')}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
