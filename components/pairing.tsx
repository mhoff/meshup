// import '../styles/globals.css'

import { group } from "console"
import { FormEvent, useState } from "react"
import { growTeam, setConnectedness } from "../models/team"
import { useTeamContext } from "../providers/team"
import { TeamMatcher } from "../utils/generator"

const Pairing: React.FC<{}> = ({}) => {
  const {team} = useTeamContext()
  const [groupSize, setGroupSize] = useState(2)
  // const [sco, setGroupSize] = useState(2)
  const [pairings, setPairings] = useState<String[][][]>([])

  const handleGeneratorSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const t = new TeamMatcher(team.labels, team.connectedness)
    setPairings(t.match(groupSize))
  }

  const handleGroupSizeInput = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setGroupSize(Number.parseInt(target.value))
  }

  return (
    <div>
      <h2>Pairing Generator</h2>
      {team.labels.length > 1 ? (
        <form onSubmit={handleGeneratorSubmit}>
        <input
          type="number"
          min={2}
          max={team.labels.length}
          value={groupSize}
          onInput={handleGroupSizeInput}
          >
        </input>
        <input type="submit" value="Generate"></input> 
      </form>

      ):(
        <p>
          You need to enter more team members to generate meaningful pairings.
        </p>
      )}
      {(pairings.length > 0) &&
        <ul>
          {pairings.map(pairing => 
            <li>
              <ul>
                {pairing.map(pair => 
                  <li>{pair.join(", ")}</li>
                )}
              </ul>
            </li>
          )}
        </ul>
      }
    </div>
    )
}

export default Pairing
