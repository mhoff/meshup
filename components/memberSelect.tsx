import { Button, Group } from "@mantine/core";
import * as React from "react";
import { Member } from "../models/collector";

export interface MemberSelectProp {
  members: Member[];
  onSelect: (member: Member) => void;
}

export default function MemberSelect({ members, onSelect }: MemberSelectProp) {
  return (
    <div>
      Which group member do you represent?
      <Group gap="sm">
        {members.map((m: Member) => (
          <Button variant="outline" key={m.id} onClick={() => onSelect(m)}>
            {m.name}
          </Button>
        ))}
      </Group>
    </div>
  );
}
