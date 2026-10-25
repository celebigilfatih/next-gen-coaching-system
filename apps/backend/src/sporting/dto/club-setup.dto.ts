import { BadRequestException } from '@nestjs/common';
import { parseBrandColor, parseSetupLogo } from './club-branding';

export const setupStaffRoles = [
  'HEAD_COACH',
  'ASSISTANT_COACH',
  'GOALKEEPER_COACH',
  'FITNESS_COACH',
  'ANALYST',
] as const;
export type SetupStaffRole = (typeof setupStaffRoles)[number];
export type SetupTeam = { key: string; name: string; ageGroupLabel: string };
export type ClubSetupBody = {
  requestId: string;
  club: {
    name: string;
    description: string;
    logo: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  season: { name: string; startDate: string; endDate: string };
  firstTeam: { name: string; ageGroupLabel: string };
  academyTeams: SetupTeam[];
  staff: {
    key: string;
    name: string;
    role: SetupStaffRole;
    teamKey: string;
    validFrom: string;
    validTo: string;
  }[];
};

function object(input: unknown, fields: string[]): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Geçersiz kurulum bilgisi.');
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((key) => !fields.includes(key)))
    throw new BadRequestException('Kurulumda desteklenmeyen alan var.');
  return body;
}

function text(input: unknown, label: string, maximum = 80, optional = false) {
  if (input === undefined && optional) return '';
  if (typeof input !== 'string')
    throw new BadRequestException(`${label} geçersiz.`);
  const value = input.normalize('NFKC').trim();
  if (
    (!optional && !value) ||
    value.length > maximum ||
    /[\p{Cc}]/u.test(value)
  )
    throw new BadRequestException(
      `${label} en fazla ${maximum} karakter olmalıdır.`,
    );
  return value;
}

export function setupRequestId(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new BadRequestException('Geçersiz kurulum istek kimliği.');
  return value.toLowerCase();
}

function key(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-z0-9_-]{1,64}$/.test(value))
    throw new BadRequestException('Geçersiz satır kimliği.');
  return value;
}

export function setupDay(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < '1900-01-01'
  )
    throw new BadRequestException('Geçerli bir takvim günü seçin.');
  const date = new Date(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    throw new BadRequestException('Geçerli bir takvim günü seçin.');
  return value;
}

// Season days are explicit Turkish calendar days, independent of server/browser TZ.
export const setupMidnight = (day: string) => new Date(`${day}T00:00:00+03:00`);

function boundedArray(value: unknown, maximum: number): unknown[] {
  if (!Array.isArray(value) || value.length > maximum)
    throw new BadRequestException(
      `Bu adım en fazla ${maximum} kayıt içerebilir.`,
    );
  return value as unknown[];
}

export function parseClubSetup(input: unknown): ClubSetupBody {
  const body = object(input, [
    'requestId',
    'club',
    'season',
    'firstTeam',
    'academyTeams',
    'staff',
  ]);
  const club = object(body.club, [
    'name',
    'description',
    'logo',
    'primaryColor',
    'secondaryColor',
  ]);
  const season = object(body.season, ['name', 'startDate', 'endDate']);
  const firstTeam = object(body.firstTeam, ['name', 'ageGroupLabel']);
  const startDate = setupDay(season.startDate);
  const endDate = setupDay(season.endDate);
  const duration = Date.parse(endDate) - Date.parse(startDate);
  if (duration < 0 || Math.floor(duration / (7 * 86_400_000)) + 1 > 80)
    throw new BadRequestException(
      'Sezon tarih aralığı geçerli ve en fazla 80 hafta olmalıdır.',
    );
  const academyTeams = boundedArray(body.academyTeams, 20).map((input) => {
    const team = object(input, ['key', 'name', 'ageGroupLabel']);
    return {
      key: key(team.key),
      name: text(team.name, 'Takım adı'),
      ageGroupLabel: text(team.ageGroupLabel, 'Yaş etiketi', 32),
    };
  });
  const teamKeys = ['first-team', ...academyTeams.map((team) => team.key)];
  const firstName = text(firstTeam.name, 'A Takım adı');
  const teamNames = [firstName, ...academyTeams.map((team) => team.name)].map(
    (name) => name.toLocaleLowerCase('tr-TR'),
  );
  if (
    new Set(teamKeys).size !== teamKeys.length ||
    new Set(teamNames).size !== teamNames.length
  )
    throw new BadRequestException(
      'Takım adları ve satır kimlikleri benzersiz olmalıdır.',
    );
  const staff = boundedArray(body.staff, 60).map((input) => {
    const person = object(input, [
      'key',
      'name',
      'role',
      'teamKey',
      'validFrom',
      'validTo',
    ]);
    if (!setupStaffRoles.includes(person.role as SetupStaffRole))
      throw new BadRequestException('Geçerli bir teknik görev seçin.');
    const teamKey = key(person.teamKey);
    if (!teamKeys.includes(teamKey))
      throw new BadRequestException(
        'Teknik görev seçili bir takıma atanmalıdır.',
      );
    const validFrom = setupDay(person.validFrom);
    const validTo = setupDay(person.validTo);
    if (validFrom < startDate || validTo > endDate || validFrom > validTo)
      throw new BadRequestException(
        'Teknik görev tarihleri sezon içinde olmalıdır.',
      );
    return {
      key: key(person.key),
      name: text(person.name, 'Kişi adı'),
      role: person.role as SetupStaffRole,
      teamKey,
      validFrom,
      validTo,
    };
  });
  if (new Set(staff.map((person) => person.key)).size !== staff.length)
    throw new BadRequestException(
      'Teknik kadro satır kimlikleri benzersiz olmalıdır.',
    );
  return {
    requestId: setupRequestId(body.requestId),
    club: {
      name: text(club.name, 'Kulüp adı'),
      description: text(club.description, 'Açıklama', 500, true),
      logo: parseSetupLogo(club.logo),
      primaryColor: parseBrandColor(club.primaryColor),
      secondaryColor: parseBrandColor(club.secondaryColor),
    },
    season: { name: text(season.name, 'Sezon adı'), startDate, endDate },
    firstTeam: {
      name: firstName,
      ageGroupLabel: text(firstTeam.ageGroupLabel, 'A Takım yaş etiketi', 32),
    },
    academyTeams,
    staff,
  };
}
