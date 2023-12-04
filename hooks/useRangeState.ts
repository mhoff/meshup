import { useCallback, useMemo, useState } from 'react';

type ValueTuple = [number | undefined, number | undefined];

export default function useRangeState<DMin, DMax>(defaultMin: DMin, defaultMax: DMax, defaultValue?: ValueTuple) {
  const [min, setMin] = useState<number | undefined>(defaultValue?.[0]);
  const [max, setMax] = useState<number | undefined>(defaultValue?.[1]);

  const range = useMemo(() => [min, max] as [number | undefined, number | undefined], [min, max]);
  const setRange = useCallback(
    (valuesOrFunction: ValueTuple | undefined | ((_: ValueTuple) => ValueTuple)) => {
      const values = typeof valuesOrFunction === 'function' ? valuesOrFunction([min, max]) : valuesOrFunction;
      const [newMin, newMax] = values ?? [undefined, undefined];
      setMin(newMin);
      setMax(newMax);
    },
    [min, max, setMin, setMax]
  );

  const minWithDefault = useMemo(() => min ?? defaultMin, [min, defaultMin]);
  const maxWithDefault = useMemo(() => max ?? defaultMax, [max, defaultMax]);
  const rangeWithDefault = useMemo(
    () => [minWithDefault, maxWithDefault] as [number, number],
    [minWithDefault, maxWithDefault]
  );

  return { min, max, range, minWithDefault, maxWithDefault, rangeWithDefault, setMin, setMax, setRange };
}
