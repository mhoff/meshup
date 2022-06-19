import { v4 as genID } from 'uuid';

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
    connectedness: [...team.connectedness.map((row) => row.concat([0])), []],
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
