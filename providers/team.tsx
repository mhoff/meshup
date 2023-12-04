import * as React from 'react';
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { Member, useMemberUnidirectionalConnection } from '../models/team';
import { arraysEqual } from '../utils/helpers';
import { notifyLoadedInitial, notifyResetPartitions } from '../utils/notifications';
import { loadFromStorage } from '../utils/persistence';

type TeamContextType = {
  members: Member[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
  partitions: number[];
  setPartitions: Dispatch<SetStateAction<number[]>>;
  getWeight: (rowIndex: number, colIndex: number) => number;
  setWeight: (rowIndex: number, colIndex: number, update: (prevWeight: number) => number) => void;
  getWeights: () => { srcIdx: number; trgIdx: number; forward: number }[];
  getMatrix: () => number[][];
  getDiagonalMatrix: () => number[][];
  setDiagonalMatrix: (matrix: number[][]) => void;
};

const Context = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: any }) {
  const [members, dispatchMembers] = useState<Member[]>([]);
  const { getWeight, setWeight, getWeights, getMatrix, setDiagonalMatrix, getDiagonalMatrix } =
    useMemberUnidirectionalConnection(members);
  const [partitions, setPartitions] = useState<number[]>([]);

  const setMembers = useCallback((ssa: SetStateAction<Member[]>) => {
    dispatchMembers((prevMembers: Member[]) => {
      const newMembers = typeof ssa === 'function' ? ssa(prevMembers) : ssa;
      if (
        !arraysEqual(
          prevMembers.map((m) => m.id),
          newMembers.map((m) => m.id)
        )
      ) {
        setPartitions((prevParts) => {
          if (prevParts.length > 0) {
            notifyResetPartitions();
          }
          return [];
        });
      }
      return newMembers;
    });
  }, []);

  const teamContext = useMemo<TeamContextType>(
    () => ({
      members,
      setMembers,
      partitions,
      setPartitions,
      getWeight,
      setWeight,
      getWeights,
      getMatrix,
      getDiagonalMatrix,
      setDiagonalMatrix,
    }),
    [members, setMembers, partitions, getWeight, setWeight, getWeights, getMatrix, getDiagonalMatrix, setDiagonalMatrix]
  );

  React.useEffect(
    () => {
      const data = loadFromStorage('default');
      if (data != null) {
        const { team: loadedTeam, partitions: loadedPartitions } = data;
        dispatchMembers(loadedTeam.members);
        // TODO ugly workaround... find a solution for the inconsistent data mapping
        setTimeout(() => {
          setDiagonalMatrix(loadedTeam.connectedness);
          setPartitions(loadedPartitions);
          notifyLoadedInitial();
        }, 50);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      /* run only once on init */
    ]
  );

  return <Context.Provider value={teamContext}>{children}</Context.Provider>;
}

export function useTeamContext(): TeamContextType {
  return useContext(Context) as TeamContextType;
}
