// import '../styles/globals.css'

import { FormEvent, useState } from "react"
import { growTeam, setConnectedness } from "../models/team"
import { useTeamContext } from "../providers/team"

const ConnectionTable: React.FC<{}> = ({}) => {
  const {team, setTeam} = useTeamContext()

  return (
    <div>
      <h1>Connectedness</h1>
      {team.labels.length > 0 &&
        <table>
          <thead>
            <tr>
              <th></th>
              {team.labels.slice().reverse().map((member, i) => (
                <th key={"col-" + i}>{member}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.connectedness.map((row, rowIndex) => (
              <tr key={"row-" + rowIndex}>
                <td>{team.labels[rowIndex]}</td>
                {row.map((cellValue, colIndex) => (
                  <td key={[rowIndex, colIndex].join("/")}
                  onClick={(e) => setTeam(setConnectedness(team, rowIndex, colIndex, cellValue + 1))}>{cellValue}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
    )
}

export default ConnectionTable
