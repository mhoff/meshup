/* eslint-disable no-underscore-dangle */
import { Connectedness } from '../models/team';
import { inputArrayFloat32, inputArrayInt32 } from './helpers';

let _Module: any = null;
async function getModule(): Promise<any> {
  if (_Module === null) {
    const path = '/kaffpa.js';
    const ModuleWrapper: any = await import(/* webpackIgnore: true */ path);

    _Module = await ModuleWrapper.default({
      print(text: string) { console.log(`stdout: ${text}`); },
      printErr(text: string) { alert(`stderr: ${text}`); },
      onAbort() { alert('abort'); },
    });
  }
  return _Module;
}

function partitionScore(parts: Int32Array, conns: number[][]): number {
  let score = 0;

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    for (let j = i + 1; j < parts.length; j++) {
      if (p === parts[j]) {
        score += conns[i][j];
      }
    }
  }

  return score;
}

export default async function partition(conn: Connectedness, nPartitions: number): Promise<number[]> {
  const negWeight = Math.min(0, Math.min(...conn.map((row) => Math.min(...row.filter(Number.isFinite)))));
  const maxWeight = Math.max(...conn.map((row) => Math.max(...row.filter(Number.isFinite)))) - negWeight;

  const edgeMap = conn.map((row, src) => ({
    src,
    edges: row.map((w, trg) => ({
      trg,
      w: Number.isNaN(w) ? NaN : (maxWeight - w - negWeight),
    })).filter(({ trg, w }) => !Number.isNaN(w) && w > 0),
  }));

  console.log(edgeMap);

  const Module = await getModule();

  const inputIntArrPtr = inputArrayInt32(Module);
  const inputFloatArrPtr = inputArrayFloat32(Module);

  const nNodes = conn.length;
  const nEdges = nNodes * nNodes;
  const imbalance = 0.00;

  const [, nodePtr] = inputIntArrPtr([nNodes]);
  const [, xadjPtr] = inputIntArrPtr(edgeMap.map(({ edges }) => edges.length)
    .reduce<number[]>((acc, v) => (acc.length === 0 ? [0, v] : acc.concat([acc[acc.length - 1] + v])), []));
  const [, adjncyPtr] = inputIntArrPtr(edgeMap.flatMap(({ edges }) => edges.map(({ trg }) => trg)));
  const [, adjcwgtPtr] = inputIntArrPtr(edgeMap.flatMap(({ edges }) => edges.map(({ w }) => w)));
  const [, npartsPtr] = inputIntArrPtr([nPartitions]);
  const [, imbalancePtr] = inputFloatArrPtr([imbalance]);
  const edgecutPtr = Module._malloc(nEdges * Int32Array.BYTES_PER_ELEMENT);
  const partsPtr = Module._malloc(nNodes * Int32Array.BYTES_PER_ELEMENT);

  const vwgtPtr = null;

  const suppressOutput = false;
  const mode = 5;

  let bestPartitioning = null;
  let bestPartitioningScore = Infinity;

  for (let i = 1; i > 0; i--) {
    const seed = Math.round(Math.random() * 10000);

    Module._kaffpa(
      nodePtr,
      vwgtPtr,
      xadjPtr,
      adjcwgtPtr,
      adjncyPtr,
      npartsPtr,
      imbalancePtr,
      suppressOutput,
      seed,
      mode,
      edgecutPtr,
      partsPtr,
    );

    // const edgecutArray = new Int32Array(Module.HEAP32.buffer, edgecutPtr, nEdges);
    const partsArray = new Int32Array(Module.HEAP32.buffer, partsPtr, nNodes);

    const score = partitionScore(partsArray, conn);

    console.log(`Found score ${score}`);

    if (score < bestPartitioningScore) {
      bestPartitioningScore = score;
      bestPartitioning = [...partsArray.values()];
    }
  }

  return bestPartitioning!!;
}
