import { useEffect, useRef, useCallback } from 'react';
import { MatchingRequest, MatchingResponse } from '../interfaces/generator';

export default function useGeneratorWorker(receiveMatches: (_: MatchingResponse) => void) {
  const workerRef: any = useRef();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/generator.worker.ts', import.meta.url),
    );
    workerRef.current.onmessage = (evt: any) => receiveMatches(evt as MatchingResponse);
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const sendMatcherRequest = useCallback((req: MatchingRequest) => {
    workerRef.current.postMessage(req);
  }, []);

  return sendMatcherRequest;
}
