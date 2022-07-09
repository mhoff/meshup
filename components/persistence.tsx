import * as React from 'react';
import { Dropzone, FullScreenDropzone } from '@mantine/dropzone';
import { Upload } from 'tabler-icons-react';
import {
  Team,
} from '../models/team';
import { importJSON } from '../utils/persistence';

interface ImporterProps {
    setTeam: (team: Team) => void
    setPartitions: (partitions: number[]) => void
    openFileRef: React.MutableRefObject<() => void>
}

export default function Importer({ setTeam, setPartitions, openFileRef }: ImporterProps) {
  const handleDrop = async (files: File[]) => {
    if (files.length === 1) {
      const file = files[0];
      const { team: loadedTeam, partitions: loadedPartitions } = await importJSON(file);
      setTeam(loadedTeam);
      setPartitions(loadedPartitions);
    }
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <Dropzone
        sx={{ display: 'none' }}
        openRef={openFileRef}
        onDrop={handleDrop}
      >
        {(status) => <Upload />}
      </Dropzone>
      <FullScreenDropzone
        accept={['application/json']}
        onDrop={handleDrop}
      >
        {(status) => <Upload />}
      </FullScreenDropzone>
    </div>
  );
}
