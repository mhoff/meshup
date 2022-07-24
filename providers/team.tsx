import { createContext, Dispatch, SetStateAction, useContext, useMemo } from 'react';
import * as React from 'react';
import { EMPTY_TEAM, Member, Team } from '../models/team';
import { loadFromStorage } from '../utils/persistence';
import { arraysEqual } from '../utils/helpers';
import { notifyLoadedInitial, notifyResetPartitions } from '../utils/notifications';

type TeamContextType = {
    team: Team
    members: Member[]
    setTeam: Dispatch<SetStateAction<Team>>
    partitions: number[]
    setPartitions: Dispatch<SetStateAction<number[]>>
}

const Context = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: any }) {
  const [partitions, dispatchPartitions] = React.useState<number[]>([]);
  const [team, dispatchTeam] = React.useState<Team>(EMPTY_TEAM);
  const teamContext = useMemo<TeamContextType>(() => ({
    team,
    members: team.members,
    setTeam: (ssa: SetStateAction<Team>) => {
      dispatchTeam((prevTeam: Team) => {
        const newTeam = typeof ssa === 'function' ? ssa(prevTeam) : ssa;
        if (!arraysEqual(prevTeam.connectedness, newTeam.connectedness)) {
          dispatchPartitions((prevParts) => {
            if (prevParts.length > 0) {
              notifyResetPartitions();
            }
            return [];
          });
        }
        return newTeam;
      });
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
