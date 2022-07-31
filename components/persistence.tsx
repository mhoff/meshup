import * as React from 'react';
import { Dropzone, FullScreenDropzone } from '@mantine/dropzone';
import { Upload } from 'tabler-icons-react';
import { Member } from '../models/team';
import { importJSON } from '../utils/persistence';

interface ImporterProps {
    setMembers: (members: Member[]) => void
    setPartitions: (partitions: number[]) => void
    setDiagonalMatrix: (matrix: number[][]) => void
    openFileRef: React.MutableRefObject<() => void>
}

export default function Importer({
  setMembers, setPartitions, setDiagonalMatrix, openFileRef,
}: ImporterProps) {
  const handleDrop = async (files: File[]) => {
    if (files.length === 1) {
      const file = files[0];
      const { team: loadedTeam, partitions: loadedPartitions } = await importJSON(file);
      setMembers(loadedTeam.members);
      setDiagonalMatrix(loadedTeam.connectedness);
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
