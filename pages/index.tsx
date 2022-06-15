import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import MemberList from '../components/members'
import ConnectionGrid from '../components/connectionGrid'
import Pairing from '../components/pairing'
import MemberGraph from '../components/memberGraph'
import { Group } from '@mantine/core';

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
        <Group grow spacing={60} align={"top"}>
          <MemberList></MemberList>
          <ConnectionGrid></ConnectionGrid>
        </Group>
        <Group grow spacing={60} align={"top"}>
          <Pairing></Pairing>
          <MemberGraph width={500} height={500}></MemberGraph>
        </Group>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
