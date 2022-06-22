import { Title } from '@mantine/core';
import * as React from 'react';
import Pairing from '../components/pairing';

export default function PairingPage() {
  return (
    <div>
      <Title order={2}>Group Generator</Title>
      <p>
        Select your desired group size and generate all best-scoring matchups (considering the connection strengths).
      </p>
      <Pairing />
    </div>
  );
}
