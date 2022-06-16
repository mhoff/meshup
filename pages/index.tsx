import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import MemberList from '../components/members'
import ConnectionGrid from '../components/connectionGrid'
import Pairing from '../components/pairing'
import MemberGraph from '../components/memberGraph'
import { Group } from '@mantine/core';
import { Grid } from '@mantine/core';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Matchup</title>
        <meta name="description" content="Advanced matching utility for teams" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Matchup
        </h1>
        <p>
          Matchup helps teams to reduce disconnectedness by generating sensible team pairings for, e.g., coffee meetups.
        </p>
        <p>
          Usage: add the members of your team (press Enter to add) and, optionally, adjust the connectedness matrix to
          reflect how well connected the members already are. Connection strengths can be adjusted by clicking on the
          individual cells. The icon in the top left indicates whether the click will produce an increment (+) or a decrement (-).
          Modes can be toggled by clicking on the icon.
          Then, the pairing generator can be used to produce all optimal pairings considering entered a-priori strengths.
          Please note that, as of now, only pairs of two are supported.
          Also please avoid large connection strengths (roughly bigger than 5).
        </p>
        <Grid justify={"center"} align={"stretch"} style={{width: "100%"}}>
          <Grid.Col sm={12} md={6}>
            <MemberList></MemberList>  
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <ConnectionGrid></ConnectionGrid>
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <Pairing></Pairing>
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <MemberGraph></MemberGraph>
          </Grid.Col>
        </Grid>
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  )
}

export default Home
