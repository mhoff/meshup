import {
  useEffect, useRef, useCallback, useState,
} from 'react';
import { Member, WeightUpdate } from '../models/collector';
import {
  CollectorServer, CollectorStateServer,
} from '../utils/collector';

export default function useCollectorServer(
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
