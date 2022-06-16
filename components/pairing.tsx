// import '../styles/globals.css'

import { Card, Input, List, NumberInput, SimpleGrid, Text } from "@mantine/core"
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
        <NumberInput
          label="Size of pairings"
          defaultValue={2}
          min={2}
          max={team.labels.length}
          onInput={handleGroupSizeInput}
          >
        </NumberInput>
        <input type="submit" value="Generate"></input> 
      </form>

      ):(
        <p>
          You need to enter more team members to generate meaningful pairings.
        </p>
      )}
      {(pairings.length > 0) &&
        <SimpleGrid cols={2}
        spacing="lg"
        breakpoints={[
          { maxWidth: 980, cols: 2, spacing: 'md' },
          { maxWidth: 755, cols: 2, spacing: 'sm' },
          { maxWidth: 600, cols: 1, spacing: 'sm' },
        ]}>
          {pairings.map((pairing, pairingIndex) => 
          <Card key={`pairing-${pairingIndex}`}>
            <Text weight={500}>{`Pairing ${pairingIndex + 1}`}</Text>
            <List>
              {pairing.map((pair, pairIndex) => 
              <List.Item key={`pair-${pairIndex}`}>
                {pair.join(", ")}
              </List.Item>
              )}
            </List>
          </Card>
          )}
        </SimpleGrid>
      }
    </div>
    )
}

export default Pairing
