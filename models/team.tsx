export type Connectedness = Array<Array<number>>

export interface Team {
  labels: Array<string>
  connectedness: Connectedness
}

export function growTeam(team: Team, newMember: string): Team {
  const oldSize = team.labels.length
  const conn = [new Array<number>(oldSize).fill(0), ...team.connectedness]
  return {
    labels: [newMember, ...team.labels],
    connectedness: conn
  }
}

export function setConnectedness(team: Team, row: number, col: number, newVal: number) {
  return {
    labels: Object.assign([], team.labels),
    connectedness: Object.assign([], team.connectedness.map((_row, rowIndex) => 
      Object.assign([], rowIndex == row ? _row.map((oldVal, colIndex) => colIndex == col ? newVal : oldVal) : _row)))
  }
}