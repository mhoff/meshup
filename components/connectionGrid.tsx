// import '../styles/globals.css'

import { FormEvent, useState } from "react"
import { getConnection, growTeam, setConnectedness, updateConnectedness } from "../models/team"
import { useTeamContext } from "../providers/team"
import { Table, Button, ActionIcon, Center } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { Plus, Minus, Icon } from 'tabler-icons-react';

interface InteractionMode {
  icon: Icon,
  func: (_: number) => number
}

const Modes: InteractionMode[] = [{
  icon: Plus,
  func: v => v + 1
}, {
  icon: Minus,
  func: v => v - 1
}]

const ConnectionGrid: React.FC<{}> = ({}) => {
  const {team, setTeam} = useTeamContext()
  const [mode, setMode] = useState<number>(0)

  return (
    <div style={{maxWidth: "400px"}}>
      <h2>Team Connectedness</h2>
      {team.labels.length > 1 ? (<Table verticalSpacing={4} sx={{ '& tbody tr td': { borderBottom: 0 } }}>
        <thead>
          <tr>
            <th>
              <Center>
                <ActionIcon size={16} onClick={() => setMode((mode + 1) % Modes.length)}>
                  {(() => {
                    // TODO improve syntax
                    const ModeIcon = Modes[mode].icon
                    return (<ModeIcon />)
                  })()}
                </ActionIcon>
              </Center>
            </th>
            {team.labels.map((member, colIndex) => (
              <th key={"col-" + colIndex}>{member}</th>
            ))}
          </tr>
        </thead>
            <tbody>
            {team.labels.map((member, rowIndex) => (
              <tr key={"row-" + rowIndex}>
                <td>{member}</td>
                {team.labels.map((_, colIndex) => {
                  if (rowIndex == colIndex) {
                    return <td key={`${rowIndex}/${colIndex}`}></td>
                  }
                  return (
                    <td key={`${rowIndex}/${colIndex}`}
                        onClick={(e) => setTeam(updateConnectedness(team, rowIndex, colIndex, Modes[mode].func))}
                    >
                    {getConnection(team, rowIndex, colIndex)}
                    </td>
                  )
                })}
              </tr>
            ))}
            </tbody>
      </Table>) : "More team members required."}
    </div>
    )
}

export default ConnectionGrid
