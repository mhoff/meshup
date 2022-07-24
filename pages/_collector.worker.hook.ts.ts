import { useEffect, useRef, useCallback } from 'react';
import { Member, WeightUpdate } from '../models/collector';

export default function useCollectorWorker(handleUpdates: (_: WeightUpdate[]) => void) {
  const workerRef: any = useRef();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/collector.worker.ts', import.meta.url),
    );
    workerRef.current.onmessage = (evt: any) => handleUpdates(evt as WeightUpdate[]);
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const runCollector = useCallback((req: Member[]) => {
    workerRef.current.postMessage(req);
  }, []);

  return runCollector;
}
