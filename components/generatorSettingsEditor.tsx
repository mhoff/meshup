import {
  ActionIcon,
  Grid,
  GridCol,
  Group,
  InputWrapper,
  NumberInput,
  NumberInputProps,
  RangeSlider,
  Stack,
  Tooltip,
  VisuallyHidden,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import * as R from 'ramda';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { AdjustmentsHorizontal, AlertCircle, InfoCircle, Settings } from 'tabler-icons-react';
import useRangeState from '../hooks/useRangeState';

export interface GeneratorSettings {
  minGroupCount: number;
  maxGroupCount: number;
  minGroupSize: number;
  maxGroupSize: number;
}

export interface GeneratorSettingsEditorProps {
  memberCount: number;
  setGeneratorSettings: (settings: GeneratorSettings | undefined) => void;
}

function onNumberChange(fn: (_: number | undefined) => void): (_: string | number) => void {
  return (value: string | number) => {
    const valueAsNumber = Number(value);
    fn(!Number.isNaN(valueAsNumber) && value !== '' ? valueAsNumber : undefined);
  };
}

export default function GeneratorSettingsEditor({
  memberCount,
  setGeneratorSettings,
}: Readonly<GeneratorSettingsEditorProps>) {
  const {
    setMin: setUserGroupCountMin,
    setMax: setUserGroupCountMax,
    setRange: setUserGroupCounts,
    rangeWithDefault: groupCounts,
    minWithDefault: groupCountMin,
    maxWithDefault: groupCountMax,
  } = useRangeState(1, memberCount, [1, 1]);

  const {
    setMin: setUserGroupSizeMin,
    setMax: setUserGroupSizeMax,
    setRange: setUserGroupSizes,
    rangeWithDefault: groupSizes,
    minWithDefault: groupSizeMin,
    maxWithDefault: groupSizeMax,
  } = useRangeState(1, memberCount);

  const [effectiveGroupCounts, groupCountBounds, groupCountsRestricted, groupCountsIllegal] = useMemo(() => {
    const groupCountBounds = [Math.ceil(memberCount / groupSizeMax), Math.floor(memberCount / groupSizeMin)];
    const effectiveRange = [Math.max(groupCountMin, groupCountBounds[0]), Math.min(groupCountMax, groupCountBounds[1])];
    const hasOverlap = groupCountMin <= groupCountBounds[1] && groupCountMax >= groupCountBounds[0];
    return [
      effectiveRange as [number, number],
      groupCountBounds as [number, number],
      hasOverlap && (groupCountMin < effectiveRange[0] || groupCountMax > effectiveRange[1]),
      !hasOverlap,
    ];
  }, [groupSizeMin, groupSizeMax, groupCountMin, groupCountMax, memberCount]);

  const [showAdvancedView, { toggle: toggleAdvanceView }] = useDisclosure(false, {
    onClose: () => {
      setUserGroupCounts([groupCountMin, groupCountMin]);
      setUserGroupSizes(undefined);
    },
  });
  const [showSliderView, { toggle: toggleSliderView }] = useDisclosure(false);

  React.useEffect(() => {
    if (groupCountsIllegal) {
      setGeneratorSettings(undefined);
    } else {
      setGeneratorSettings({
        minGroupCount: effectiveGroupCounts[0],
        maxGroupCount: effectiveGroupCounts[1],
        minGroupSize: groupSizeMin,
        maxGroupSize: groupSizeMax,
      });
    }
  }, [effectiveGroupCounts, groupSizeMin, groupSizeMax, groupCountsIllegal, setGeneratorSettings]);

  const CustomNumberInput = useCallback(
    (props: NumberInputProps) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <NumberInput allowNegative={false} allowDecimal={false} hideControls min={1} max={memberCount} {...props} />
    ),
    [memberCount]
  );

  return (
    <Grid align="flex-end">
      <GridCol span="auto" style={{ maxWidth: '100%' /* avoid bug */ }}>
        {!showAdvancedView && (
          <CustomNumberInput
            label="Desired number of groups"
            value={groupCounts?.[0]}
            onChange={onNumberChange((value) =>
              value !== undefined ? setUserGroupCounts([value, value]) : setUserGroupCounts(undefined)
            )}
          />
        )}
        {showAdvancedView && !showSliderView && (
          <>
            <InputWrapper label="Allowed number of groups">
              <Group justify="space-between" gap={0} align="start">
                <CustomNumberInput
                  description="Minimum"
                  value={groupCountMin}
                  onChange={onNumberChange(setUserGroupCountMin)}
                  error={groupCountMax < groupCountMin ? 'Maximum < Minimum' : undefined}
                  style={{ width: '49%' }}
                />
                <CustomNumberInput
                  description="Maximum"
                  value={groupCountMax}
                  onChange={onNumberChange(setUserGroupCountMax)}
                  error={
                    groupCountMax < groupCountMin ? <VisuallyHidden>{'Maximum < Minimum'}</VisuallyHidden> : undefined
                  }
                  style={{ width: '49%' }}
                />
              </Group>
            </InputWrapper>
            <InputWrapper label="Allowed size of groups">
              <Group justify="space-between" gap={0} align="start">
                <CustomNumberInput
                  description="Minimum"
                  value={groupSizeMin}
                  onChange={onNumberChange(setUserGroupSizeMin)}
                  error={groupSizeMax < groupSizeMin ? 'Maximum < Minimum' : undefined}
                  style={{ width: '49%' }}
                />
                <CustomNumberInput
                  description="Maximum"
                  value={groupSizeMax}
                  onChange={onNumberChange(setUserGroupSizeMax)}
                  error={
                    groupSizeMax < groupSizeMin ? <VisuallyHidden>{'Maximum < Minimum'}</VisuallyHidden> : undefined
                  }
                  style={{ width: '49%' }}
                />
              </Group>
            </InputWrapper>
          </>
        )}
        {showAdvancedView && showSliderView && (
          <>
            <InputWrapper
              label={`Allowed number of groups: ${
                groupCounts[0] === groupCounts[1] ? groupCounts[0] : groupCounts.join(' - ')
              }`}
            >
              <RangeSlider
                className="group-count-slider"
                label={null}
                step={1}
                minRange={0}
                min={1}
                max={memberCount}
                marks={R.range(1, memberCount + 1).map((i) => ({
                  value: i,
                  label: i === 1 || i === memberCount ? i : '',
                }))}
                value={groupCounts}
                onChange={setUserGroupCounts}
                style={{ marginBottom: '29.5px', marginTop: '10px' }}
                color={groupCountMax < groupCountMin ? 'red' : undefined}
              />
            </InputWrapper>
            <InputWrapper label={`Allowed group sizes: ${groupSizes[0]} - ${groupSizes[1]}`}>
              <RangeSlider
                label={null}
                step={1}
                minRange={0}
                min={1}
                max={memberCount}
                marks={R.range(1, memberCount + 1).map((i) => ({
                  value: i,
                  label: i === 1 || i === memberCount ? i : '',
                }))}
                value={groupSizes}
                onChange={setUserGroupSizes}
                style={{ marginBottom: '29.5px', marginTop: '10px' }}
                color={groupSizeMax < groupSizeMin ? 'red' : undefined}
              />
            </InputWrapper>
          </>
        )}
      </GridCol>
      <GridCol span="content">
        <Stack gap={10}>
          {showAdvancedView && groupCountsIllegal && (
            <Tooltip
              position="right"
              label={
                <>
                  Given the allowed group sizes, only group counts in the range ({`${groupCountBounds.join(' - ')}`})
                  are feasible.
                  <br />
                  There is currently no overlap between the allowed numbers of groups and this range.
                  <br />
                  Click to select only valid group counts.
                </>
              }
            >
              <ActionIcon variant="white" color="red" onClick={() => setUserGroupCounts(groupCountBounds)}>
                <VisuallyHidden>Warning</VisuallyHidden>
                <AlertCircle />
              </ActionIcon>
            </Tooltip>
          )}
          {showAdvancedView && groupCountsRestricted && (
            <Tooltip
              position="right"
              label={
                <>
                  Given the allowed group sizes, only group counts in the range ({`${groupCountBounds.join(' - ')}`})
                  are feasible.
                  <br />
                  Hence we will only look for solutions within group counts ({`${effectiveGroupCounts.join(' - ')}`}).
                  <br />
                  Click to make this your selection.
                </>
              }
            >
              <ActionIcon variant="white" color="orange" onClick={() => setUserGroupCounts(effectiveGroupCounts)}>
                <VisuallyHidden>Warning</VisuallyHidden>
                <InfoCircle />
              </ActionIcon>
            </Tooltip>
          )}
          {showAdvancedView && (
            <Tooltip position="right" label={`${showSliderView ? 'Hide' : 'Show'} sliders`}>
              <ActionIcon onClick={() => toggleSliderView()} variant={showSliderView ? 'filled' : 'outline'}>
                <VisuallyHidden>Slider View</VisuallyHidden>
                <AdjustmentsHorizontal />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip position="right" label={`${showAdvancedView ? 'Hide' : 'Show'} advanced configuration options`}>
            <ActionIcon onClick={() => toggleAdvanceView()} variant={showAdvancedView ? 'filled' : 'outline'}>
              <VisuallyHidden>Advanced Options</VisuallyHidden>
              <Settings />
            </ActionIcon>
          </Tooltip>
        </Stack>
      </GridCol>
    </Grid>
  );
}
