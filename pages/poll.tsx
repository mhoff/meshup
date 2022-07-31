import { Button, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import * as React from 'react';
import { useCallback } from 'react';
import ConnectionGrid from '../components/connectionGrid';
import MemberGraph from '../components/memberGraph';
import useCollectorServer from '../hooks/_pollServer.hook';
import { WeightUpdate } from '../models/collector';
import { useMemberConnection } from '../models/team';
import { useTeamContext } from '../providers/team';

const CollectorStatus = dynamic(() => import('../components/collectorStatus'), { ssr: false });

export default function PollPage() {
  const { members, partitions, setWeight: setResultWeight } = useTeamContext();

  const {
    getWeight, getWeights, setWeight, setWeightById,
  } = useMemberConnection(members);

  const updateRatingMatrix = useCallback((ws: WeightUpdate[]) => ws.forEach(
    ({ sourceId, targetId, weight }) => setWeightById(sourceId, targetId, () => weight),
  ), [setWeightById]);

  const { collectorState, runCollector } = useCollectorServer(members, updateRatingMatrix);

  const completePoll = useCallback(() => {
    getWeights().forEach(({
      srcIdx, trgIdx, forward, backward,
    }) => {
      setResultWeight(srcIdx, trgIdx, () => (forward + backward) / 2);
    });
  }, [getWeights, setResultWeight]);

  React.useEffect(() => {
    runCollector();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Title order={2}>Live Poll - Alpha</Title>
      <p>
        Optional Step; Share the below link with your team.
        Members will then be able to assess individually how connected they feel to each other.
        <br />
        <br />
        IMPORTANT.
        For active polling to succeed, a stable internet connection is required.
        Also, members do need to conclude their rating at the same time this page is open and active.
        Asynchronous rating is not supported as of now.
      </p>
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          {collectorState !== undefined && <CollectorStatus state={collectorState!!} />}
          <Button onClick={completePoll}>Complete Poll</Button>
        </div>
        <br />
        <br />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        <div style={{ maxWidth: '100%' }}>
          <Title order={4}>Connectivity Matrix</Title>
          <div style={{ overflow: 'auto' }}>
            <ConnectionGrid members={members} getWeight={getWeight} setWeight={setWeight} />
          </div>
        </div>
        <div style={{ flexGrow: 1 }}>
          <Title order={4}>Visualization</Title>
          <MemberGraph members={members} getWeights={getWeights} partitions={partitions} bidirectional />
        </div>
      </div>
    </div>
  );
}
