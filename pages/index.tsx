import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import MemberList from '../components/members'
import ConnectionTable from '../components/connectionTable'
import Pairing from '../components/pairing'
import MemberGraph from '../components/memberGraph'

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

        <MemberList></MemberList>
        <ConnectionTable></ConnectionTable>
        <MemberGraph width={500} height={500}></MemberGraph>
        <Pairing></Pairing>
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
