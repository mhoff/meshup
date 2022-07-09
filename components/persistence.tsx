import { useRef, useState } from 'react';
import {
  Select, Button,
} from '@mantine/core';
import * as React from 'react';
import { Dropzone, FullScreenDropzone } from '@mantine/dropzone';
import { Upload } from 'tabler-icons-react';
import { useTeamContext } from '../providers/team';
import {
  Team,
} from '../models/team';

interface PersistenceBackend {
    name: string
    save: (entry: string, team: Team, partitions: number[]) => void
    load: (entry?: string, blob?: string) => { team: Team, partitions: number[]} | null
    entries: () => string[]
}

const localStorageBackend: PersistenceBackend = {
  name: 'Browser (Local Storage)',
  save: (entry: string, team: Team, partitions: number[]) => {
    const blob = JSON.stringify({ team, partitions });
    localStorage.setItem(entry !== undefined ? entry : 'default', blob);
  },
  load: (_entry?: string) => {
    const entry: string = _entry !== undefined ? _entry : 'default';
    const data = localStorage.getItem(entry);
    if (data === null) {
      console.error('Failed loading data');
      return null;
    }
    return JSON.parse(data) as { team: Team, partitions: number[] };
  },
  entries: () => [],
};

const fileBackend: PersistenceBackend = {
  name: 'File Export/Import',
  save: (entry: string, team: Team, partitions: number[]) => {
    const json = JSON.stringify({ team, partitions });
    const href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));

    const link = document.createElement('a');
    link.href = href;
    link.download = `${entry}.json`;
    link.click();
    link.remove();

    URL.revokeObjectURL(href);
  },
  load: (entry?: string, blob?: string) => {
    console.log(entry!!);
    return JSON.parse(blob!!) as { team: Team, partitions: number[] };
  },
  entries: () => [],
};

const backends = Object.fromEntries([localStorageBackend, fileBackend].map((backend) => [backend.name, backend]));

export default function PersistenceControl() {
  const {
    team, setTeam, partitioning, setPartitioning: setPartitions,
  } = useTeamContext();

  const openRef = useRef<() => void>(null);

  const [selectedBackendName, setSelectedBackendName] = useState(localStorageBackend.name);

  return (
    <div style={{ maxWidth: '400px' }}>
      <Select
        label="Data source"
        data={Object.keys(backends)}
        value={selectedBackendName}
        onChange={(val) => setSelectedBackendName(val!!)}
      />
      <Button
        onClick={() => backends[selectedBackendName].save('default', team, partitioning)}
      >
        Save
      </Button>
      <Button
        onClick={() => {
          const { team: loadedTeam, partitions: loadedPartitions } = backends[selectedBackendName].load('default')!!;
          setTeam(loadedTeam);
          setPartitions(loadedPartitions);
        }}
      >
        Load
      </Button>
      <Dropzone
        openRef={openRef}
        onDrop={async (files) => {
          if (files.length === 1) {
            const file = files[0];
            const { team: loadedTeam, partitions: loadedPartitions } = fileBackend.load(file.name, await file.text())!!;
            setTeam(loadedTeam);
            setPartitions(loadedPartitions);
          }
        }}
      >
        {(status) => <Upload />}
      </Dropzone>
      <FullScreenDropzone
        accept={['application/json']}
        onDrop={async (files) => {
          if (files.length === 1) {
            const file = files[0];
            const { team: loadedTeam, partitions: loadedPartitions } = fileBackend.load(file.name, await file.text())!!;
            setTeam(loadedTeam);
            setPartitions(loadedPartitions);
          }
        }}
      >
        {(status) => <Upload />}
      </FullScreenDropzone>
    </div>
  );
}
