import { Grid } from '@mantine/core';
import Head from 'next/head';
import ConnectionGrid from '../components/connectionGrid';
import MemberGraph from '../components/memberGraph';
import MemberList from '../components/members';
import Pairing from '../components/pairing';
import { useTeamContext } from '../providers/team';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { members, setMembers, partitions, setPartitions, getMatrix, getWeights, getWeight, setWeight } =
    useTeamContext();

  return (
    <div className={styles.container}>
      <Head>
        <title>Mesh:up</title>
        <meta name="description" content="Advanced matching utility for teams" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Mesh:up</h1>
        <p>
          Mesh:up helps teams to reduce disconnectedness by generating sensible team pairings for, e.g., coffee meetups.
        </p>
        <p>
          Usage: Add the members of your team and, optionally, adjust the connectedness matrix to reflect how well
          connected the members already are.
          <br />
          Connection strengths can be adjusted by clicking on the individual cells. The icon in the top left indicates
          whether the click will produce an increment (+) or a decrement (-). Modes can be toggled by clicking on the
          icon. Mesh:up seeks to match those together who are most disconnected (= low connection strength), while
          favoring an optimal solution for the whole group.
          <br />
          Last, the pairing generator needs to be configured for the desired group size and run. An heuristically
          optimal solution will be presented and visualized in the graph view.
          <br />
          <br />
          Limitations: Please note that, as of now, group sizes are not always upheld in favor of overall optimality.
          Hence, groups of 1 or, in general, deviations from the desired group size might occurr.
        </p>
        <Grid justify="center" align="stretch" gutter={30} style={{ width: '100%' }}>
          <Grid.Col span={{ sm: 12, md: 3 }}>
            <h2>Team Members</h2>
            <MemberList members={members} setMembers={setMembers} />
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 9 }}>
            <h2>Team Connectedness</h2>
            <div style={{ overflow: 'auto' }}>
              <ConnectionGrid members={members} getWeight={getWeight} setWeight={setWeight} />
            </div>
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 3 }}>
            <h2>Pairing Generator</h2>
            <Pairing getMatrix={getMatrix} members={members} partitions={partitions} setPartitions={setPartitions} />
          </Grid.Col>
          <Grid.Col span={{ sm: 12, md: 9 }}>
            <h2>Team Graph</h2>
            <MemberGraph getWeights={getWeights} members={members} partitions={partitions} />
          </Grid.Col>
        </Grid>
      </main>
    </div>
  );
}
