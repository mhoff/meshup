import { PartitioningRequest, PartitioningResponse } from '../interfaces/generator';
import partition from '../utils/solver';

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (event: MessageEvent) => {
  const req = event.data as PartitioningRequest;
  const result = await partition(req.connectedness, req.groupSize);
  const response: PartitioningResponse = {
    partitions: result,
  };
  postMessage(response);
});

export {};
