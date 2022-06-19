/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// import '../styles/globals.css'

import * as React from 'react';
import { setConnectedness } from '../models/team';
import { useTeamContext } from '../providers/team';

export default function ConnectionTable() {
  const { team, setTeam } = useTeamContext();

  return (
    <div>
      <h1>Connectedness</h1>
      {team.size > 0
        && (
        <table>
          <thead>
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th />
              {team.members.slice().reverse().map((member, i) => (
                <th key={`col-${member.id}`}>{member.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {team.connectedness.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td>{team.members[rowIndex].name}</td>
                {row.map((cellValue, colIndex) => (
                  <td
                    key={[rowIndex, colIndex].join('/')}
                    onClick={() => setTeam(setConnectedness(team, rowIndex, colIndex, cellValue + 1))}
                  >
                    {cellValue}

                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        )}
    </div>
  );
}
