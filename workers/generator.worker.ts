import { MatchingRequest, MatchingResponse } from '../interfaces/generator';
import { matchTeam } from '../utils/generator';

/*
function calc(): number {
  console.log('calc');
  let result = 1;
  for (let i = 1; i < 10; i++) {
    result *= i;
  }
  return result;
}
*/

// eslint-disable-next-line no-restricted-globals
addEventListener('message', (event: MessageEvent) => {
  const req = event.data as MatchingRequest;
  const result = matchTeam(req.connectedness, req.groupSize, req.alternateGroupSizes);
  const response: MatchingResponse = {
    matches: result,
  };
  postMessage(response);
});

export {};
