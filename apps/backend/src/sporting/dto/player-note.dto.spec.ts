import { BadRequestException } from '@nestjs/common';
import {
  parseCreatePlayerNote,
  parsePlayerNotePage,
  parseShareBody,
  parseUpdatePlayerNote,
} from './player-note.dto';

describe('player note DTO boundaries', () => {
  it('accepts a structured note without mass-assignable ownership fields', () => {
    expect(
      parseCreatePlayerNote({
        originTeamId: 'team-1',
        category: 'TACTICAL',
        body: '  Dar alanda ilk pas yönünü vücut açısıyla geliştir.  ',
        observedAt: '2026-09-09T12:00:00.000Z',
        followUpAt: '2026-09-16T12:00:00.000Z',
        followUpStatus: 'OPEN',
      }),
    ).toEqual(
      expect.objectContaining({
        originTeamId: 'team-1',
        category: 'TACTICAL',
        body: 'Dar alanda ilk pas yönünü vücut açısıyla geliştir.',
        followUpStatus: 'OPEN',
      }),
    );
    expect(() =>
      parseCreatePlayerNote({
        originTeamId: 'team-1',
        category: 'GENERAL',
        body: 'Not',
        observedAt: '2026-09-09T12:00:00.000Z',
        authorId: 'attacker',
      }),
    ).toThrow(BadRequestException);
  });

  it('requires versioned edits and paired follow-up fields', () => {
    expect(() =>
      parseUpdatePlayerNote({
        expectedVersion: 0,
        category: 'GENERAL',
        body: 'Not',
        observedAt: '2026-09-09T12:00:00.000Z',
      }),
    ).toThrow('Invalid expectedVersion');
    expect(() =>
      parseUpdatePlayerNote({
        expectedVersion: 1,
        category: 'GENERAL',
        body: 'Not',
        observedAt: '2026-09-09T12:00:00.000Z',
        followUpAt: '2026-09-10T12:00:00.000Z',
      }),
    ).toThrow('followUpAt and followUpStatus must be supplied together');
  });

  it('rejects unknown list fields and duplicate team grants', () => {
    expect(() => parsePlayerNotePage({ limit: '20', clubId: 'other' })).toThrow(
      'Unknown player note query field',
    );
    expect(() =>
      parseShareBody({ expectedVersion: 1, teamIds: ['team-1', 'team-1'] }),
    ).toThrow('Invalid teamIds');
  });
});
