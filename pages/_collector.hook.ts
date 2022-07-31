import {
  useEffect, useRef, useCallback, useState,
} from 'react';
import { Member, WeightUpdate } from '../models/collector';
import {
  CollectorServer, CollectorClient, CollectorStateClient, CollectorStateServer,
} from '../utils/collector';

export function useCollectorServer(
  members: Member[],
  handleUpdates: (_: WeightUpdate[]) => void,
) {
  const workerRef: any = useRef();
  const [collectorState, setCollectorState] = useState<CollectorStateServer>();

  useEffect(() => {
    if (workerRef.current !== undefined) {
      workerRef.current.setCallback(handleUpdates);
      workerRef.current.setMembers(members);
    }
    return () => {
      // cleanup
      workerRef.current?.destroy(); // TODO implement
    };
  }, [members, handleUpdates]);

  const runCollector = useCallback(() => {
    workerRef.current = new CollectorServer(members, handleUpdates, setCollectorState);
  }, [members, handleUpdates]);

  const stopCollector = useCallback(() => {
    workerRef.current?.destroy();
    workerRef.current = undefined;
  }, []);

  return { collectorState, runCollector, stopCollector };
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
