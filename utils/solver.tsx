/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-alert */

import * as R from 'ramda';
import { Connectedness } from '../models/team';
import { inputArrayFloat32, inputArrayInt32 } from './helpers';

let moduleSingleton: any = null;
async function getModule(): Promise<any> {
  if (moduleSingleton === null) {
    const path = '/kaffpa.js';
    const ModuleWrapper: any = await import(/* webpackIgnore: true */ path);

    moduleSingleton = await ModuleWrapper.default({
      print(text: string) {
        console.log(`stdout: ${text}`);
      },
      printErr(text: string) {
        alert(`stderr: ${text}`);
      },
      onAbort() {
        alert('abort');
      },
    });
  }
  return moduleSingleton;
}

export interface Partitioning {
  kind: string;
  partitionPerNode: number[];
  partitionSizes: number[];
  sumOfInternalWeights: number;
  partitionSizeSpread: number;
}

function getSumOfWeights(parts: Int32Array, conns: number[][]): number {
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

function derivePartitioning(parts: Int32Array, conns: number[][]): Partitioning {
  const partitionPerNode = [...parts.values()];
  const partitionSizes = R.values(R.countBy(R.identity, partitionPerNode)).sort();
  return {
    kind: partitionSizes.join(','),
    partitionPerNode,
    partitionSizes,
    sumOfInternalWeights: getSumOfWeights(parts, conns),
    partitionSizeSpread: Math.max(...partitionSizes) - Math.min(...partitionSizes),
  };
}

export default async function partition(
  conn: Connectedness,
  partitionCounts: number[],
  minSize: number,
  maxSize: number,
  maxIterationsPerCount: number = 40
): Promise<Partitioning[]> {
  const negWeight = Math.min(0, Math.min(...conn.map((row) => Math.min(...row.filter(Number.isFinite)))));
  const maxWeight = Math.max(...conn.map((row) => Math.max(...row.filter(Number.isFinite)))) - negWeight;

  const edgeMap = conn.map((row, src) => ({
    src,
    edges: row
      .map((w, trg) => ({
        trg,
        w: Number.isNaN(w) ? NaN : maxWeight - w - negWeight,
      }))
      .filter(({ w }) => !Number.isNaN(w) && w > 0),
  }));

  const Module = await getModule();

  const inputIntArrPtr = inputArrayInt32(Module);
  const inputFloatArrPtr = inputArrayFloat32(Module);

  const nNodes = conn.length;
  const nEdges = nNodes * nNodes;
  const imbalance = 0.0;

  const [, nodePtr] = inputIntArrPtr([nNodes]);
  const [, xadjPtr] = inputIntArrPtr(
    edgeMap
      .map(({ edges }) => edges.length)
      .reduce<number[]>((acc, v) => (acc.length === 0 ? [0, v] : acc.concat([acc[acc.length - 1] + v])), [])
  );
  const [, adjncyPtr] = inputIntArrPtr(edgeMap.flatMap(({ edges }) => edges.map(({ trg }) => trg)));
  const [, adjcwgtPtr] = inputIntArrPtr(edgeMap.flatMap(({ edges }) => edges.map(({ w }) => w)));
  const [, imbalancePtr] = inputFloatArrPtr([imbalance]);
  const edgecutPtr = Module._malloc(nEdges * Int32Array.BYTES_PER_ELEMENT);
  const partsPtr = Module._malloc(nNodes * Int32Array.BYTES_PER_ELEMENT);

  const vwgtPtr = null;

  const suppressOutput = false;
  const perfectBalance = true;
  const mode = 5;

  const bestPerKind: { [kind: string]: Partitioning } = {};

  for (let i = 0; i < partitionCounts.length; i++) {
    let iterations = maxIterationsPerCount;
    // eslint-disable-next-line no-plusplus
    while (iterations-- > 0) {
      const [, npartsPtr] = inputIntArrPtr([partitionCounts[i]]);
      const seed = Math.round(Math.random() * 10000);

      Module._kaffpa_balance(
        nodePtr,
        vwgtPtr,
        xadjPtr,
        adjcwgtPtr,
        adjncyPtr,
        npartsPtr,
        imbalancePtr,
        perfectBalance,
        suppressOutput,
        seed,
        mode,
        edgecutPtr,
        partsPtr
      );

      // const edgecutArray = new Int32Array(Module.HEAP32.buffer, edgecutPtr, nEdges);
      const partsArray = new Int32Array(Module.HEAP32.buffer, partsPtr, nNodes);

      const curr = derivePartitioning(partsArray, conn);

      if (
        Math.min(...curr.partitionSizes) >= minSize &&
        Math.max(...curr.partitionSizes) <= maxSize &&
        partitionCounts.includes(curr.partitionSizes.length)
      ) {
        console.log(
          `Partitioning: internal weights = ${curr.sumOfInternalWeights}, sizes = ${curr.partitionSizes}, ` +
            `spread = ${curr.partitionSizeSpread}, count = ${curr.partitionSizes.length}`
        );

        const best = bestPerKind[curr.kind] ?? null;

        if (
          best == null ||
          curr.sumOfInternalWeights < best.sumOfInternalWeights ||
          (curr.sumOfInternalWeights === best.sumOfInternalWeights &&
            curr.partitionSizeSpread < best.partitionSizeSpread)
        ) {
          bestPerKind[curr.kind] = curr;
        }
      }
    }
  }

  return Object.values(bestPerKind);
}
