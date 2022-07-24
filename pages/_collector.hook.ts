import { useEffect, useRef, useCallback, useState } from 'react';
import { Member, WeightUpdate } from '../models/collector';
import {
  CollectorServer, CollectorClient, CollectorStateClient, CollectorStateServer,
} from '../utils/collector';

export function useCollectorServer(
  handleState: (_: CollectorStateServer) => void,
  handleUpdates: (_: WeightUpdate[]) => void,
) {
  const workerRef: any = useRef();
  // const [weightUpdates, setWeightUpdates] = useState<WeightUpdate[]>([]);

  useEffect(() => () => {
    // cleanup
    workerRef.current?.destroy(); // TODO implement
  }, []);

  const runCollector = useCallback((members: Member[]) => {
    workerRef.current = new CollectorServer(members, handleUpdates, handleState);
  }, []);

  return runCollector;
}

export function useCollectorClient() {
  const workerRef: any = useRef();
  const [collectorState, setCollectorState] = useState<CollectorStateClient>();

  useEffect(() => () => {
    // cleanup
    workerRef.current?.destroy(); // TODO implement
  }, []);

  const runCollector = useCallback((peerId: string) => {
    workerRef.current = new CollectorClient(peerId, setCollectorState);
  }, []);

  const setRating = useCallback((srcId: string, trgId: string, weight: number) => {
    workerRef.current.updateWeight(srcId, trgId, weight);
  }, []);

  return { collectorState, runCollector, setRating };
}
