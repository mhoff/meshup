// import '../styles/globals.css'

import {
  Box,
  Button,
  Collapse,
  Group,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import * as R from 'ramda';
import { FormEvent, useMemo, useState } from 'react';
import { Check, X } from 'tabler-icons-react';
import { Member } from '../models/collector';
import partition, { Partitioning } from '../utils/solver';
import styles from './Pairing.module.scss';
import GeneratorSettingsEditor, { GeneratorSettings } from './generatorSettingsEditor';

interface PairingProps {
  members: Member[];
  partitions: number[];
  setPartitions: (partitions: number[]) => void;
  getMatrix: () => number[][];
}

interface ResultMeta {
  partitioningResults: Partitioning[];
  minWeight: number;
  minSpread: number;
  singleBest: boolean;
}

export default function Pairing({ members, partitions, setPartitions, getMatrix }: PairingProps) {
  const [generatorSettings, setGeneratorSettings] = useState<GeneratorSettings | undefined>(undefined);
  const [inputError, setInputError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultMeta, setResultMeta] = useState<ResultMeta>();

  const handleGeneratorSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (generatorSettings) {
      setLoading(true);
      setInputError(undefined);
      setResultMeta(undefined);
      setPartitions([]);

      setTimeout(async () => {
        const result = await partition(
          getMatrix(),
          R.range(generatorSettings.minGroupCount, generatorSettings.maxGroupCount + 1),
          generatorSettings.minGroupSize,
          generatorSettings.maxGroupSize
        );

        if (result.length === 0) {
          setInputError(
            'Mesh:up failed to compute a result using the given parameterization. This does not imply there is none.'
          );
        } else {
          const minWeight = Math.min(...R.map(R.prop('sumOfInternalWeights'), result));
          const minSpread = Math.min(...R.map(R.prop('partitionSizeSpread'), result));

          const bestResults = result.filter(
            (p) => p.sumOfInternalWeights === minWeight && p.partitionSizeSpread === minSpread
          );

          if (bestResults.length === 1) {
            setPartitions(bestResults[0].partitionPerNode);
          }
          setResultMeta({
            partitioningResults: result,
            minSpread,
            minWeight,
            singleBest: bestResults.length === 1,
          });
        }
        setLoading(false);
      }, 50);
    }
  };

  const partitioningResults = useMemo(() => {
    const sortResults = R.sortWith<Partitioning>([
      R.ascend(R.prop('sumOfInternalWeights')),
      R.ascend(R.prop('partitionSizeSpread')),
      R.ascend(R.pipe(R.prop('partitionSizes'), R.length)),
    ]);
    return resultMeta ? sortResults(resultMeta.partitioningResults) : undefined;
  }, [resultMeta]);

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

  const displayAllResults = true; // TODO should be able to toggle?

  return (
    <div className={styles.pairing}>
      {members.length > 1 ? (
        <Box pos="relative">
          <LoadingOverlay visible={loading} />

          <form onSubmit={handleGeneratorSubmit}>
            <GeneratorSettingsEditor memberCount={members.length} setGeneratorSettings={setGeneratorSettings} />
            <Button type="submit" fullWidth disabled={generatorSettings === undefined} style={{ marginTop: 20 }}>
              Generate
            </Button>
            {inputError && <div>{inputError}</div>}
            {loading && <span>Loading...</span>}
            {partitioningResults && resultMeta && (
              <Box style={{ marginTop: 20 }}>
                {partitioningResults.length === 0 && <Text>No results found.</Text>}
                {partitioningResults.length === 1 && (
                  <Text>The algorithm identified one optimal solution which has been auto-selected.</Text>
                )}
                {partitioningResults.length > 1 && (
                  <>
                    <Text>
                      The algorithm identified {partitioningResults.length} different solutions{' '}
                      {resultMeta.singleBest && <span>from which the single best has been auto-selected</span>}
                      {!resultMeta.singleBest && <span>with multiple optimal results (please select one)</span>}:
                    </Text>
                    {partitioningResults.length > 1 && (
                      <Collapse in={displayAllResults}>
                        <ScrollArea h={300} type="auto" offsetScrollbars>
                          {partitioningResults.map((p) => (
                            <Paper
                              key={p.kind}
                              p="md"
                              shadow="md"
                              style={{ margin: 10 }}
                              onClick={() => setPartitions(p.partitionPerNode)}
                              withBorder
                              styles={{ root: partitions === p.partitionPerNode ? { borderColor: 'green' } : {} }}
                            >
                              <Text>Number of groups: {p.partitionSizes.length}</Text>
                              <Text>Groups: [{p.partitionSizes.join(',')}]</Text>
                              <Group gap={1}>
                                <Text>Internal connectedness: {p.sumOfInternalWeights}</Text>
                                {p.sumOfInternalWeights === resultMeta.minWeight && (
                                  <Tooltip label="optimal result" position="right">
                                    <ThemeIcon variant="white" color="green">
                                      <Check strokeWidth={4} size={13} />
                                    </ThemeIcon>
                                  </Tooltip>
                                )}
                                {p.sumOfInternalWeights !== resultMeta.minWeight && (
                                  <Tooltip label={`worse than the minimum of ${resultMeta.minWeight}`} position="right">
                                    <ThemeIcon variant="white" color="red">
                                      <X strokeWidth={4} size={13} />
                                    </ThemeIcon>
                                  </Tooltip>
                                )}
                              </Group>
                              <Group gap={1}>
                                <Text>Group size spread: {p.partitionSizeSpread} </Text>
                                {p.partitionSizeSpread === resultMeta.minSpread && (
                                  <Tooltip label="optimal result" position="right">
                                    <ThemeIcon variant="white" color="green">
                                      <Check strokeWidth={4} size={13} />
                                    </ThemeIcon>
                                  </Tooltip>
                                )}
                                {p.partitionSizeSpread !== resultMeta.minSpread && (
                                  <Tooltip label={`worse than the minimum of ${resultMeta.minSpread}`} position="right">
                                    <ThemeIcon variant="white" color="red">
                                      <X strokeWidth={4} size={13} />
                                    </ThemeIcon>
                                  </Tooltip>
                                )}
                              </Group>
                            </Paper>
                          ))}
                        </ScrollArea>
                      </Collapse>
                    )}
                  </>
                )}
              </Box>
            )}
            {partitionedMembers && (
              <Box style={{ marginTop: 20 }}>
                <Text>These are the resulting groups and their members:</Text>
                <ol>
                  {partitionedMembers.map(({ members, partition }) => (
                    <li key={partition}>{members.map((m) => m.name).join(', ')}</li>
                  ))}
                </ol>
              </Box>
            )}
          </form>
        </Box>
      ) : (
        <p>You need to enter more team members to generate meaningful pairings.</p>
      )}
    </div>
  );
}
