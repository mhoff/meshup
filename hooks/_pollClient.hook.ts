import { useCallback, useEffect, useRef, useState } from 'react';
import { CollectorClient, CollectorStateClient } from '../utils/collector';

export default function useCollectorClient() {
  const workerRef: any = useRef();
  const [collectorState, setCollectorState] = useState<CollectorStateClient>();

  useEffect(
    () => () => {
      // cleanup
      workerRef.current?.destroy(); // TODO implement
    },
    []
  );

  const runCollector = useCallback((peerId: string) => {
    workerRef.current = new CollectorClient(peerId, setCollectorState);
  }, []);

  const setRating = useCallback((srcId: string, trgId: string, weight: number) => {
    workerRef.current.updateWeight(srcId, trgId, weight);
  }, []);

  return { collectorState, runCollector, setRating };
}
