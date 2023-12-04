import * as React from "react";
import { Dropzone } from "@mantine/dropzone";
import { Upload } from "tabler-icons-react";
import { Member } from "../models/team";
import { importJSON } from "../utils/persistence";

interface ImporterProps {
  setMembers: (members: Member[]) => void;
  setPartitions: (partitions: number[]) => void;
  setDiagonalMatrix: (matrix: number[][]) => void;
  openFileRef: React.MutableRefObject<() => void>;
}

export default function Importer({
  setMembers,
  setPartitions,
  setDiagonalMatrix,
  openFileRef,
}: ImporterProps) {
  const handleDrop = async (files: File[]) => {
    if (files.length === 1) {
      const file = files[0];
      const { team: loadedTeam, partitions: loadedPartitions } =
        await importJSON(file);
      setMembers(loadedTeam.members);
      setDiagonalMatrix(loadedTeam.connectedness);
      setPartitions(loadedPartitions);
    }
  };

  return (
    <div style={{ maxWidth: "400px" }}>
      <Dropzone
        style={{ display: "none" }}
        openRef={openFileRef}
        onDrop={handleDrop}
      >
        <Dropzone.Accept>
          <Upload />
        </Dropzone.Accept>
      </Dropzone>
      <Dropzone.FullScreen accept={["application/json"]} onDrop={handleDrop}>
        <Dropzone.Accept>
          <Upload />
        </Dropzone.Accept>
      </Dropzone.FullScreen>
    </div>
  );
}
