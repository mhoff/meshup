import { FormEvent, useState } from "react"
import { growTeam, shrinkTeam, swapMembers } from "../models/team"
import { useTeamContext } from "../providers/team"
import { Table, Space, ActionIcon } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { CornerDownLeft, Trash, ArrowUp, ArrowDown } from 'tabler-icons-react';

const MemberList: React.FC<{}> = ({}) => {
  const {team, setTeam} = useTeamContext()
  const [input, setInput] = useState("")
  const [error, setError] = useState("")

  const handleNewMemberSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!error && input.length > 0) {
      setTeam(growTeam(team, input))
      setInput("")
    }
  }

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value.trim()
    setInput(target.value);
    if (!value.match("^.*\\S+.*$")) {
      setError("Please enter a valid name")
    } else if (target.value.length > 0 && team.labels.includes(value)) {
      setError("This member already exists")
    } else {
      setError("")
    }
  }

  return (
    <div style={{maxWidth: "400px"}}>
      <h2>Team Members</h2>
      <Table verticalSpacing={4} sx={{ '& tbody tr td': { borderBottom: 0 } }}>
        <thead>
          <tr>
            <th>Member Name</th>
            <th style={{ width: 16 }}></th>
            <th style={{ width: 16 }}></th>
            <th style={{ width: 16 }}></th>
          </tr>
        </thead>
            <tbody>
              {team.labels.map((label, index) => (
                <tr key={index}>
                  <td>{label}</td>
                  <td>
                    {index > 0 && (
                    <ActionIcon size={16} onClick={() => setTeam(swapMembers(team, index - 1, index))}>
                      <ArrowUp></ArrowUp>
                    </ActionIcon>
                    )}
                  </td>
                  <td>
                    {index < team.labels.length - 1 && (
                    <ActionIcon size={16} onClick={() => setTeam(swapMembers(team, index, index + 1))}>
                      <ArrowDown></ArrowDown>
                    </ActionIcon>
                    )}
                  </td>
                  <td>
                    <ActionIcon size={16} onClick={() => setTeam(shrinkTeam(team, index))}>
                      <Trash></Trash>
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
      </Table>
      <Space h="md" />
      <form onSubmit={handleNewMemberSubmit}>
        <TextInput
          type="text"
          placeholder="Enter new member"
          value={input}
          onChange={handleInput}
          onInvalid={(e) => { (e.target as HTMLInputElement).setCustomValidity(""); e.preventDefault() }}
          rightSection={<CornerDownLeft size={16} />}
          error={error.length > 0 ? error : ""}
          >
        </TextInput>
      </form>
    </div>
    )
}

export default MemberList
