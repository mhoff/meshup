import { createContext, useContext, useState } from "react";
import { Team } from "../models/team";

type TeamContextType = {
    team: Team
    setTeam: (team: Team) => void
}

const Context = createContext<TeamContextType | null>(null);

export const TeamProvider = ({ children }: { children: any }) => {
  const [team, dispatch] = useState<Team>({
      labels: [],
      connectedness: []
  })
  return (
    <Context.Provider value={{ team: team, setTeam: (team: Team) => dispatch(team) }}>{children}</Context.Provider>
  )
}

export function useTeamContext(): TeamContextType {
  return useContext(Context) as TeamContextType
}