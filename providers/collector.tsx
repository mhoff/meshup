import { createContext, useContext, useMemo, useState } from 'react';
import * as React from 'react';
import { useTeamContext } from './team';
import { ClientData, ServerOpen, WeightUpdate } from '../models/collector';
import { Team, updateConnectedness } from '../models/team';
import { CollectorStateServer, NetworkState } from '../utils/collector';
import { useCollectorServer } from '../pages/_collector.hook';

type CollectorContext = {
    collectorActive: boolean,
    setCollectorActive: (state: boolean) => void,
    // connectedMembers: String[]
    connectedPeers: number,
    peerId: string | null,
}

const Context = createContext<CollectorContext | null>(null);

export function CollectorProvider({ children }: { children: any }) {
  const { members, setTeam } = useTeamContext();

  function handleUpdates(updates: WeightUpdate[]) {
    setTeam((prevTeam: Team) => (updates.reduce<Team>((acc, update) => {
      const srcIdx = prevTeam.members.findIndex((m) => m.id === update.sourceId);
      const trgIdx = prevTeam.members.findIndex((m) => m.id === update.targetId);
      return updateConnectedness(acc, srcIdx, trgIdx, () => update.weight);
    }, prevTeam)));
  }

  const [collectorState, setCollectorState] = useState<CollectorStateServer>();
  const runCollector = useCollectorServer(setCollectorState, handleUpdates);

  const peerContext = useMemo<CollectorContext>(() => ({
    collectorActive: collectorState !== undefined,
    setCollectorActive: (newState: boolean) => {
      const oldState = collectorState != null;
      if (oldState !== newState) {
        if (newState) {
          runCollector(members);
        }
      }
    },
    // connectedMembers: state === null ? [] : state.conns.map((c) => c.memberId).filter((m) => m !== null),
    connectedPeers: collectorState === undefined ? 0 : collectorState.connections,
    peerId: collectorState === undefined ? null : collectorState.peerId,
  }), [members, collectorState, runCollector]);

  return (
    <Context.Provider value={peerContext}>
      {children}
    </Context.Provider>
  );
}

export function useCollectorContext(): CollectorContext {
  return useContext(Context) as CollectorContext;
}
