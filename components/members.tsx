// import '../styles/globals.css'

import { bool } from "prop-types"
import { FormEvent, useState } from "react"
import { growTeam } from "../models/team"
import { useTeamContext } from "../providers/team"



const MemberList: React.FC<{}> = ({}) => {
  const {team, setTeam} = useTeamContext()
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  const handleNewMemberSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!error && input.length > 0) {
      setTeam(growTeam(team, input))
      setInput("")
    }
  }

  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setInput(target.value);
    setError(target.validity.patternMismatch || target.validity.badInput)
  }

  return (
    <div>
      <h1>Team Members</h1>
      <ul>
        {team.labels.map((member, i) => (
          <li key={i}>{member}</li>
        ))}
      </ul>
      <form onSubmit={handleNewMemberSubmit}>
        <input
          type="string"
          pattern="\S*([ ]*|\S*)*\S+"
          value={input}
          onInput={handleInput}
          style={error ? { backgroundColor: "rgba(255, 0, 0, 0.5)" } : {}}
          >
        </input>
      </form>
    </div>
    )
}

export default MemberList
