import { BadRequestException } from '@nestjs/common';
import {
  parseCreateSportingTeamBody,
  parseUpdateSportingTeamBody,
} from './team-lifecycle.dto';

describe('Sporting team lifecycle input boundary', () => {
  const create = {
    clubId: 'club-a',
    clubSeasonId: 'season-a',
    name: 'U17 Takımı',
    ageGroupLabel: 'U17',
    classification: 'ACADEMY',
  };

  it('accepts configurable, normalized age labels', () => {
    expect(
      parseCreateSportingTeamBody({ ...create, ageGroupLabel: 'B Takım' }),
    ).toEqual({ ...create, ageGroupLabel: 'B Takım' });
    expect(parseUpdateSportingTeamBody({ ageGroupLabel: 'Gelişim 2' })).toEqual(
      { name: undefined, ageGroupLabel: 'Gelişim 2' },
    );
  });

  it.each([
    undefined,
    null,
    [],
    {},
    { ...create, clubId: '' },
    { ...create, clubSeasonId: '*' },
    { ...create, name: ' U17 ' },
    { ...create, ageGroupLabel: 'U17\n' },
    { ...create, ageGroupLabel: 'x'.repeat(33) },
    { ...create, classification: 'A_TAKIM' },
    { ...create, archivedAt: null },
  ])('rejects malformed or mass-assigned create body %#', (input) => {
    expect(() => parseCreateSportingTeamBody(input)).toThrow(
      BadRequestException,
    );
  });

  it.each([
    undefined,
    null,
    {},
    { clubId: 'club-b' },
    { classification: 'ACADEMY' },
    { name: ' Updated ' },
    { ageGroupLabel: '' },
  ])('rejects malformed or ownership-changing update body %#', (input) => {
    expect(() => parseUpdateSportingTeamBody(input)).toThrow(
      BadRequestException,
    );
  });
});
