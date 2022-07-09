import { createContext, useContext, useMemo } from 'react';
import * as React from 'react';
import { EMPTY_TEAM, Member, Team } from '../models/team';

type TeamContextType = {
    team: Team
    members: Member[]
    setTeam: (team: Team) => void
    partitioning: number[]
    setPartitioning: (parts: number[]) => void
}

const Context = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: any }) {
  const [partitioning, dispatchPartitioning] = React.useState<number[]>([]);
  const [team, dispatchTeam] = React.useState<Team>(EMPTY_TEAM);
  const teamContext = useMemo<TeamContextType>(() => ({
    team,
    members: team.members,
    setTeam: (newTeam: Team) => dispatchTeam(newTeam),
    partitioning,
    setPartitioning: dispatchPartitioning,
  }), [team, partitioning]);

  return (
    <Context.Provider value={teamContext}>
      {children}
    </Context.Provider>
  );
}

export function useTeamContext(): TeamContextType {
  return useContext(Context) as TeamContextType;
}
