import { BadRequestException } from '@nestjs/common';
import {
  parseCreateAssignmentBody,
  parseEndAssignmentBody,
  parseTransitionPrimaryBody,
} from './sporting.dto';

describe('sporting DTO boundary', () => {
  it('projects only supported assignment fields', () => {
    expect(
      parseCreateAssignmentBody({
        personId: 'person-a',
        teamId: 'team-a',
        roleDefinitionId: 'role-player',
        assignmentType: 'TRAINING_GUEST',
        validFrom: '2026-09-06T10:00:00.000Z',
        reason: 'Older-team exposure',
        clubId: 'club-attacker',
        createdById: 'user-attacker',
        source: 'UNTRUSTED',
      }),
    ).toEqual({
      personId: 'person-a',
      teamId: 'team-a',
      teamSeasonId: undefined,
      roleDefinitionId: 'role-player',
      assignmentType: 'TRAINING_GUEST',
      validFrom: new Date('2026-09-06T10:00:00.000Z'),
      validTo: undefined,
      reason: 'Older-team exposure',
    });
  });

  it.each([
    null,
    [],
    {},
    { personId: 'p', roleDefinitionId: 'r', assignmentType: 'UNKNOWN' },
    {
      personId: 'p',
      roleDefinitionId: 'r',
      assignmentType: 'PRIMARY_REGISTERED',
      validFrom: 'not-a-date',
    },
    {
      personId: 'p',
      roleDefinitionId: 'r',
      assignmentType: 'PRIMARY_REGISTERED',
      validFrom: '2026-09-07T00:00:00.000Z',
      validTo: '2026-09-06T00:00:00.000Z',
    },
  ])('rejects malformed assignment input %#', (input) => {
    expect(() => parseCreateAssignmentBody(input)).toThrow(BadRequestException);
  });

  it('parses explicit end and transition timestamps', () => {
    expect(
      parseEndAssignmentBody({ validTo: '2026-09-07T00:00:00.000Z' }),
    ).toEqual({
      validTo: new Date('2026-09-07T00:00:00.000Z'),
      reason: undefined,
    });
    expect(
      parseTransitionPrimaryBody({
        personId: 'p',
        teamId: 'u19',
        roleDefinitionId: 'player-role',
        validAt: '2026-09-07T00:00:00.000Z',
      }),
    ).toEqual({
      personId: 'p',
      teamId: 'u19',
      teamSeasonId: undefined,
      roleDefinitionId: 'player-role',
      validAt: new Date('2026-09-07T00:00:00.000Z'),
      reason: undefined,
    });
  });
});
