import * as R from 'ramda';
import { useCallback, useMemo } from 'react';
import { useStateWithDeps } from 'use-state-with-deps';
import { v4 as genID } from 'uuid';
import { usePrevious } from '../utils/helpers';

export type Connectedness = Array<Array<number>>

export interface Member {
  name: string,
  id: string,
}
export interface Team {
  size: number
  members: Member[]
  connectedness: Connectedness
}

export const EMPTY_TEAM: Team = {
  size: 0,
  members: [],
  connectedness: [],
};

function sorted(...args: number[]): number[] {
  return [...args].sort((a, b) => a - b);
}

export function newMember(name: string): Member {
  return {
    name,
    id: genID(),
  };
}

export function prependTeam(team: Team, newMemberName: string): Team {
  const conn = [new Array<number>(team.size).fill(0), ...team.connectedness];
  return {
    size: team.size + 1,
    members: [{
      name: newMemberName,
      id: genID(),
    }, ...team.members],
    connectedness: conn,
  };
}

export function appendTeam(team: Team, newMemberName: string): Team {
  return {
    size: team.size + 1,
    members: [...team.members, {
      name: newMemberName,
      id: genID(),
    }],
    connectedness: [new Array<number>(team.size).fill(0), ...team.connectedness],
    // [...team.connectedness.map((row) => row.concat([0])), []],
  };
}

export const growTeam = appendTeam;

function* withRowRemoved(conn: Connectedness, rowIndex: number, colIndex: number): Generator<number[], any, undefined> {
  for (let r = 0; r < rowIndex; r++) {
    yield conn[r].filter((_, c) => c !== colIndex);
  }
  yield* conn.slice(rowIndex + 1);
}

export function shrinkTeam(team: Team, colIndex: number): Team {
  // TODO index mixup....
  const rowIndex = team.size - 1 - colIndex;
  return {
    size: team.size - 1,
    members: team.members.filter((_, c) => c !== colIndex),
    connectedness: [...withRowRemoved(team.connectedness, rowIndex, colIndex)],
  };
}

export function swapMembers(team: Team, _c1: number, _c2: number): Team {
  const [c1, c2] = sorted(_c1, _c2);
  const [r1, r2] = sorted(...[c1, c2].map((v) => team.size - 1 - v));
  const result = {
    size: team.size,
    members: team.members.slice(),
    connectedness: team.connectedness.map((row) => row.slice()),
  };
  result.members[c1] = team.members[c2];
  result.members[c2] = team.members[c1];

  const oldConn = team.connectedness;
  const newConn = result.connectedness;

  for (let r = 0; r < r1; r++) {
    // swap columns up to first row to swap
    newConn[r][c1] = oldConn[r][c2];
    newConn[r][c2] = oldConn[r][c1];
  }
  for (let c = 0; c < c1; c++) {
    // swap rows up to first column to swap
    newConn[r2][c] = oldConn[r1][c];
    newConn[r1][c] = oldConn[r2][c];
  }
  // skip common cell (r1, c1) as it's already correct
  for (let i = oldConn[r1].length - c1 - 1; i > 0; i--) {
    // swap remaining cells diagonally across rows/columns
    newConn[r1][c1 + i] = oldConn[r1 + i][c1];
    newConn[r1 + i][c1] = oldConn[r1][c1 + i];
  }

  return result;
}

export function setConnectedness(team: Team, row: number, col: number, newVal: number) {
  return {
    size: team.size,
    members: Object.assign([], team.members),
    connectedness: Object.assign([], team.connectedness.map(
      (_row, rowIndex) => Object.assign([], rowIndex === row
        ? _row.map((oldVal, colIndex) => (colIndex === col ? newVal : oldVal))
        : _row),
    )),
  };
}

export function updateConnectedness(team: Team, _c1: number, _c2: number, vFunc: (_: number) => number) {
  const [c1, c2] = sorted(_c1, _c2);
  const [row, col] = [team.size - 1 - c2, c1];
  return {
    size: team.size,
    members: Object.assign([], team.members),
    connectedness: Object.assign([], team.connectedness.map(
      (_row, rowIndex) => Object.assign([], rowIndex === row
        ? _row.map((oldVal, colIndex) => (colIndex === col ? vFunc(oldVal) : oldVal))
        : _row),
    )),
  };
}

export function getConnection(team: Team, _c1: number, _c2: number) {
  const [c1, c2] = sorted(_c1, _c2);
  const [row, col] = [team.size - 1 - c2, c1];
  return team.connectedness[row][col];
}

type Matrix = number[][]

export function useMemberConnection(members: Member[], defaultWeight: number = 0) {
  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const prevMemberIds = usePrevious(memberIds);

  const [matrix, setMatrix] = useStateWithDeps<Matrix>(
    (prevMatrix: Matrix | undefined) => {
      const newMatrix = new Array(memberIds.length).fill(0).map(
        (m1) => new Array(memberIds.length).fill(0).map(
          (m2) => {
            const prevRowIdx = prevMemberIds?.indexOf(m1) || -1;
            const prevColIdx = prevMemberIds?.indexOf(m2) || -1;
            return prevMatrix !== undefined && prevRowIdx !== -1 && prevColIdx !== -1
              ? prevMatrix[prevRowIdx][prevColIdx]
              : defaultWeight;
          },
        ),
      );
      return newMatrix;
    },
    [memberIds],
  );

  const getWeight = useCallback(
    (srcIdx: number, trgIdx: number) => matrix[srcIdx][trgIdx],
    [matrix],
  );

  const getWeightById = useCallback(
    (srcId: string, trgId: string) => matrix[memberIds.indexOf(srcId)][memberIds.indexOf(trgId)],
    [matrix, memberIds],
  );

  const setWeight = useCallback(
    (srcIdx: number, trgIdx: number, update: ((prevWeight: number) => number)) => {
      setMatrix((prevMatrix: Matrix) => {
        const newMatrix = R.clone(prevMatrix);
        newMatrix[srcIdx][trgIdx] = update(prevMatrix[srcIdx][trgIdx]);
        return newMatrix;
      });
    },
    [setMatrix],
  );

  const setWeightById = useCallback(
    (srcId: string, trgId: string, update: (
      (prevWeight: number) => number)) => setWeight(memberIds.indexOf(srcId), memberIds.indexOf(trgId), update),
    [memberIds, setWeight],
  );

  const getWeights: () => { srcIdx: number, trgIdx: number, forward: number, backward: number }[] = useCallback(
    () => matrix.flatMap(
      (row, rowIdx: number) => (row.slice(0, rowIdx).map((forward: number, colIdx: number) => ({
        srcIdx: rowIdx,
        trgIdx: colIdx,
        forward,
        backward: matrix[colIdx][rowIdx],
      }))),
    ),
    [matrix],
  );

  return {
    getWeight, getWeightById, getWeights, setWeight, setWeightById,
  };
}

function toDiagonalIdxs(total: number, srcIdx: number, trgIdx: number) {
  const [c1, c2] = sorted(srcIdx, trgIdx);
  const [row, col] = [total - 1 - c2, c1];
  return [row, col];
}

const getDiagonalWeight = (matrix: Matrix, srcIdx: number, trgIdx: number) => {
  const [row, col] = toDiagonalIdxs(matrix.length, srcIdx, trgIdx);
  return matrix[row][col];
};

const getDiagonalWeightById = (
  matrix: Matrix,
  ids: string[],
  srcId: string,
  trgId: string,
) => getDiagonalWeight(matrix, ids.indexOf(srcId), ids.indexOf(trgId));

export function useMemberUnidirectionalConnection(members: Member[], defaultWeight: number = 0) {
  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const prevMemberIds = usePrevious(memberIds);

  const [matrix, setMatrix] = useStateWithDeps<Matrix>(
    (prevMatrix: Matrix | undefined) => {
      const newMatrix = new Array(memberIds.length).fill(0).map(
        (m1, rowIdx) => new Array(memberIds.length - 1 - rowIdx).fill(0).map(
          (m2) => {
            if (prevMatrix !== undefined && prevMemberIds !== undefined
                && [m1, m2].every(prevMemberIds.includes.bind(prevMemberIds))) {
              return getDiagonalWeightById(prevMatrix, prevMemberIds, m1, m2);
            }
            return defaultWeight;
          },
        ),
      );
      return newMatrix;
    },
    [memberIds],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getWeight = useCallback(
    getDiagonalWeight.bind(null, matrix),
    [matrix],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getWeightById = useCallback(
    getDiagonalWeightById.bind(null, matrix, memberIds),
    [matrix, memberIds],
  );

  const setWeight = useCallback(
    (srcIdx: number, trgIdx: number, update: ((prevWeight: number) => number)) => {
      setMatrix((prevMatrix: Matrix) => {
        const newMatrix = R.clone(prevMatrix);
        const [row, col] = toDiagonalIdxs(prevMatrix.length, srcIdx, trgIdx);
        newMatrix[row][col] = update(prevMatrix[row][col]);
        return newMatrix;
      });
    },
    [setMatrix],
  );

  const setWeightById = useCallback(
    (srcId: string, trgId: string, update: (
      (prevWeight: number) => number)) => {
      setMatrix((prevMatrix: Matrix) => {
        const newMatrix = R.clone(prevMatrix);
        const [row, col] = toDiagonalIdxs(prevMatrix.length, memberIds.indexOf(srcId), memberIds.indexOf(trgId));
        newMatrix[row][col] = update(prevMatrix[row][col]);
        return newMatrix;
      });
    },
    [memberIds, setMatrix],
  );

  const getWeights: () => { srcIdx: number, trgIdx: number, forward: number }[] = useCallback(
    () => matrix.flatMap(
      (row, rowIdx: number) => (row.map((forward: number, colIdx: number) => ({
        srcIdx: matrix.length - 1 - rowIdx,
        trgIdx: colIdx,
        forward,
      }))),
    ),
    [matrix],
  );

  const getMatrix: () => number[][] = useCallback(
    () => matrix.map((row, rx) => row.concat(NaN, ...matrix.slice(0, rx)
      .map((r) => r[matrix.length - 1 - rx]).reverse())).reverse(),
    [matrix],
  );

  const setDiagonalMatrix: (data: number[][]) => void = useCallback(
    (data: number[][]) => setMatrix(data),
    [setMatrix],
  );

  const getDiagonalMatrix: () => number[][] = useCallback(
    () => matrix,
    [matrix],
  );

  return {
    getWeight, getWeightById, getWeights, setWeight, setWeightById, getMatrix, getDiagonalMatrix, setDiagonalMatrix,
  };
}
