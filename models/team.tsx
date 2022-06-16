import { connect } from "http2"
import { resourceLimits } from "worker_threads"

export type Connectedness = Array<Array<number>>

export interface Team {
  labels: Array<string>
  connectedness: Connectedness
}

export function prependTeam(team: Team, newMember: string): Team {
  const oldSize = team.labels.length
  const conn = [new Array<number>(oldSize).fill(0), ...team.connectedness]
  return {
    labels: [newMember, ...team.labels],
    connectedness: conn
  }
}

export function appendTeam(team: Team, newMember: string): Team {
  return {
    labels: [...team.labels, newMember],
    connectedness: [...team.connectedness.map(row => row.concat([0])), []]
  }
}

export const growTeam = appendTeam

function *withRowRemoved(conn: Connectedness, rowIndex: number, colIndex: number): Generator<number[], any, undefined> {
  for (let r = 0; r < rowIndex; r++) {
    yield conn[r].filter((_, c) => c != colIndex)
  }
  yield* conn.slice(rowIndex+1)
}

export function shrinkTeam(team: Team, _index: number): Team {
  // TODO index mixup....
  const colIndex = _index
  const rowIndex = team.labels.length - 1 - colIndex
  return {
    labels: team.labels.filter((_, c) => c != colIndex),
    connectedness: [...withRowRemoved(team.connectedness, rowIndex, colIndex)]
  }
}

export function swapMembers(team: Team, r1: number, r2: number): Team {
  [r1, r2] = [r1, r2].sort()
  const [c1, c2] = [r1, r2].map(v => team.labels.length - 1 - v).sort()
  const result = {
    labels: team.labels.slice(),
    connectedness: team.connectedness.map(row => row.slice())
  }
  result.labels[r1] = team.labels[r2]
  result.labels[r2] = team.labels[r1]

  const oldConn = team.connectedness
  const newConn = result.connectedness

  for (let r = 0; r < r1; r++) {
    // swap columns up to first row to swap
    newConn[r][c1] = oldConn[r][c2]
    newConn[r][c2] = oldConn[r][c1]
  }
  for (let c = 0; c < c1; c++) {
    // swap rows up to first column to swap
    newConn[r2][c] = oldConn[r1][c]
    newConn[r1][c] = oldConn[r2][c]
  }
  // skip common cell (r1, c1) as it's already correct
  for (let i = oldConn[r1].length - c1 - 1; i > 0; i--) {
    // swap remaining cells diagonally across rows/columns
    newConn[r1][c1 + i] = oldConn[r1 + i][c1]
    newConn[r1 + i][c1] = oldConn[r1][c1 + i]
  }

  return result
}

export function setConnectedness(team: Team, row: number, col: number, newVal: number) {
  return {
    labels: Object.assign([], team.labels),
    connectedness: Object.assign([], team.connectedness.map((_row, rowIndex) => 
      Object.assign([], rowIndex == row ? _row.map((oldVal, colIndex) => colIndex == col ? newVal : oldVal) : _row)))
  }
}

export function updateConnectedness(team: Team, c1: number, c2: number, vFunc: (oldValue: number) => number) {
  [c1, c2] = [c1, c2].sort()
  const [row, col] = [team.labels.length - 1 - c2, c1]
  return {
    labels: Object.assign([], team.labels),
    connectedness: Object.assign([], team.connectedness.map((_row, rowIndex) => 
      Object.assign([], rowIndex == row ? _row.map((oldVal, colIndex) => colIndex == col ? vFunc(oldVal) : oldVal) : _row)))
  }
}

export function getConnection(team: Team, c1: number, c2: number) {
  [c1, c2] = [c1, c2].sort()
  const [row, col] = [team.labels.length - 1 - c2, c1]
  return team.connectedness[row][col]
}