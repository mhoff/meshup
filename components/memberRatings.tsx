import { Slider, Table } from '@mantine/core';
import * as React from 'react';
import { useState } from 'react';
import { Member } from '../models/collector';

export interface MemberRatingsProp {
  members: Member[],
  onRatingChange: (memberId: string, rating: number) => void,
}

export default function MemberRatings({ members, onRatingChange }: MemberRatingsProp) {
  const [ratings, setRatings] = useState<Map<string, number | undefined>>(new Map());

  React.useEffect(() => {
    // keep ratings if members change
    setRatings(
      (prevRatings) => (
        new Map((members || []).map((m) => [m.id, (prevRatings.has(m.id) ? prevRatings.get(m.id) : undefined)]))
      ),
    );
  }, [members]);

  return (
    <Table>
      <thead>
        <tr>
          <th>
            Member Name
          </th>
          <th>
            Connectedness
          </th>
        </tr>
      </thead>
      <tbody>
        {members && members.map((m: Member) => (
          <tr key={m.id}>
            <td>
              {m.name}
            </td>
            <td>
              <span>
                {ratings.get(m.id) === undefined ? 'Unrated' : 'Rated'}
              </span>
              <Slider
                label={null}
                marks={[
                  { value: 10, label: 'No contact yet' },
                  { value: 25, label: 'Talked once' },
                  { value: 50, label: 'Multiple touching points' },
                  { value: 75, label: 'Worked together' },
                  { value: 90, label: 'Best buddies' },
                ]}
                value={ratings.get(m.id)}
                onChange={(value: number) => {
                  setRatings((prevRatings) => new Map(prevRatings.set(m.id, value)));
                  onRatingChange(m.id, value);
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
