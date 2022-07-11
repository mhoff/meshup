import { createContext, useContext, useMemo } from 'react';
import * as React from 'react';
import { EMPTY_TEAM, Member, Team } from '../models/team';
import { loadFromStorage } from '../utils/persistence';
import { arraysEqual } from '../utils/helpers';
import { notifyLoadedInitial, notifyResetPartitions } from '../utils/notifications';

type TeamContextType = {
    team: Team
    members: Member[]
    setTeam: (team: Team) => void
    partitions: number[]
    setPartitions: (parts: number[]) => void
}

const Context = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: any }) {
  const [partitions, dispatchPartitions] = React.useState<number[]>([]);
  const [team, dispatchTeam] = React.useState<Team>(EMPTY_TEAM);
  const teamContext = useMemo<TeamContextType>(() => ({
    team,
    members: team.members,
    setTeam: (newTeam: Team) => {
      if (partitions.length > 0 && !arraysEqual(team.connectedness, newTeam.connectedness)) {
        notifyResetPartitions();
        dispatchPartitions([]);
      }
      dispatchTeam(newTeam);
    },
    partitions,
    setPartitions: dispatchPartitions,
  }), [team, partitions]);

  React.useEffect(() => {
    const data = loadFromStorage('default');
    if (data != null) {
      const { team: loadedTeam, partitions: loadedPartitions } = data;
      dispatchTeam(loadedTeam);
      dispatchPartitions(loadedPartitions);
      notifyLoadedInitial();
    }
  }, [/* run only once on init */]);

  return (
    <Context.Provider value={teamContext}>
      {children}
    </Context.Provider>
  );
}

export function useTeamContext(): TeamContextType {
  return useContext(Context) as TeamContextType;
}
