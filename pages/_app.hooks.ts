import { useEffect, useRef, useCallback } from 'react';
import { PartitioningRequest, PartitioningResponse } from '../interfaces/generator';

export default function useSolverWorker(receiveMatches: (_: PartitioningResponse) => void) {
  const workerRef: any = useRef();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/solver.worker.ts', import.meta.url),
    );
    workerRef.current.onmessage = (evt: any) => receiveMatches(evt as PartitioningResponse);
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const sendMatcherRequest = useCallback((req: PartitioningRequest) => {
    workerRef.current.postMessage(req);
  }, []);

  return sendMatcherRequest;
}
