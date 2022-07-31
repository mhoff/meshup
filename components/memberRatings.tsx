import { Slider, Table } from '@mantine/core';
import * as R from 'ramda';
import * as React from 'react';
import { useState } from 'react';
import { Member } from '../models/collector';

export interface MemberRatingsProp {
  members: Member[],
  onRatingChange: (memberId: string, rating: number) => void,
}

const RATING_MARKS = [
  { value: 0, label: 'No contact yet' },
  { value: 25, label: 'Single touching point' },
  { value: 50, label: 'Multiple touching points' },
  { value: 75, label: 'Working together' },
  { value: 90, label: 'Best buddies' },
];

function getClosestMark(val: number): string {
  const minMarkBy = R.minBy((mark: { value: number, label: string }) => Math.abs(val - mark.value));
  const mark = RATING_MARKS.reduce(minMarkBy);
  return `${mark.label} ${val - mark.value < 0 ? '-' : '+'}`;
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
                {ratings.get(m.id) === undefined ? 'Unrated' : getClosestMark(ratings.get(m.id)!!)}
              </span>
              <Slider
                label={getClosestMark}
                styles={{ markLabel: { display: 'none' } }}
                marks={RATING_MARKS}
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
