import { Title } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useMemo, useState } from 'react';
import MemberRatings from '../components/memberRatings';
import MemberSelect from '../components/memberSelect';
import Shell from '../components/shell';
import { Member } from '../models/collector';
import { NetworkState } from '../utils/collector';
import useCollectorClient from '../hooks/_pollClient.hook';

export default function CollectorClient() {
  const router = useRouter();

  const { collectorState, runCollector, setRating } = useCollectorClient();

  const [clientMember, setClientMember] = useState<Member | null>(null);

  const members = useMemo(() => collectorState?.members.filter(
    (m) => m.id !== clientMember?.id,
  ) || null, [collectorState, clientMember]);

  const { peerId: queryPeerId } = router.query;

  React.useEffect(() => {
    if (queryPeerId !== undefined) {
      const peerId = queryPeerId instanceof Array ? queryPeerId[0] : queryPeerId;
      runCollector(peerId);
      showNotification({
        id: 'client-connect',
        title: 'Connecting to host',
        message: 'Connecting to remote host...',
        loading: true,
        disallowClose: true,
        autoClose: false,
      });
    }
  }, [queryPeerId, runCollector]);

  React.useEffect(() => {
    if (collectorState !== undefined) {
      updateNotification({
        id: 'client-connect',
        title: 'Connect successful',
        message: 'Connection to host successfuly established.',
        loading: false,
        autoClose: collectorState.networkState === NetworkState.CONNECTED,
      });
    }
  }, [collectorState]);

  const setRatingCallback = useMemo(
    () => (clientMember !== null ? setRating.bind(null, clientMember?.id) : null),
    [clientMember, setRating],
  );

  if (collectorState === undefined) {
    return null;
  }

  return (
    <div>
      <div>
        <Title order={2}>Rate your connectedness</Title>
        <p>
          A host has provided you with this url to self-assess
          how well you are in touch with your colleagues.

          Start by choosing which team member you represent
          and then estimate how well you are connected to each other team member.
        </p>
      </div>
      {members !== null && members?.length > 0 && clientMember === null
      && (
      <MemberSelect members={members} onSelect={setClientMember} />
      )}
      {members && clientMember !== null
      && (
      <MemberRatings
        members={members}
        onRatingChange={setRatingCallback!!}
      />
      )}
    </div>
  );
}

CollectorClient.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Shell nav={false}>
      {page}
    </Shell>
  );
};
