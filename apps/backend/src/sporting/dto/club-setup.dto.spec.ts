import { parseClubSetup } from './club-setup.dto';
import { parseBrandColor, parseSetupLogo } from './club-branding';

const body = () => ({
  requestId: '206b139d-4593-4fa7-bb1b-47f154dc4c37',
  club: {
    name: 'Yeni Kulüp',
    primaryColor: '#ffffff',
    secondaryColor: '#112233',
  },
  season: { name: '2026-2027', startDate: '2026-08-14', endDate: '2027-05-23' },
  firstTeam: { name: 'A Takım', ageGroupLabel: 'SENIOR' },
  academyTeams: [{ key: 'u8', name: 'U8 Takımı', ageGroupLabel: 'U8' }],
  staff: [] as object[],
});

describe('club setup validation and branding boundary', () => {
  it('accepts optional staff/logo and normalizes identity fields', () => {
    const input = body();
    input.club.name = '  Yeni Kulüp  ';
    expect(parseClubSetup(input).club).toMatchObject({
      name: 'Yeni Kulüp',
      logo: null,
      description: '',
    });
    expect(parseClubSetup(input).staff).toEqual([]);
  });
  it.each([
    'requestId',
    'club',
    'season',
    'firstTeam',
    'academyTeams',
    'staff',
  ])('requires %s', (field) => {
    const input = { ...body(), [field]: undefined };
    expect(() => parseClubSetup(input)).toThrow();
  });
  it.each(['2026-02-30', '2026-08-14T00:00:00Z', '1899-01-01', 'not-a-date'])(
    'rejects invalid day %s',
    (startDate) => {
      const input = body();
      input.season.startDate = startDate;
      expect(() => parseClubSetup(input)).toThrow();
    },
  );
  it('rejects reversed/oversized seasons and duplicate normalized teams', () => {
    const input = body();
    input.season.endDate = '2026-01-01';
    expect(() => parseClubSetup(input)).toThrow();
    input.season.endDate = '2029-01-01';
    expect(() => parseClubSetup(input)).toThrow();
    input.season.endDate = '2027-05-23';
    input.academyTeams[0].name = 'Ａ Takım';
    expect(() => parseClubSetup(input)).toThrow();
  });
  it('rejects unknown nested permission/account/tenant fields', () => {
    expect(() => parseClubSetup({ ...body(), clubId: 'foreign' })).toThrow();
    expect(() =>
      parseClubSetup({
        ...body(),
        club: { ...body().club, ownerId: 'foreign' },
      }),
    ).toThrow();
    expect(() =>
      parseClubSetup({
        ...body(),
        staff: [
          {
            key: 'person',
            name: 'Kişi',
            role: 'HEAD_COACH',
            teamKey: 'first-team',
            validFrom: '2026-08-14',
            validTo: '2027-05-23',
            capabilities: ['TEAM_MANAGE'],
          },
        ],
      }),
    ).toThrow();
  });
  it('bounds payload rows and restricts staff to selected teams and dates', () => {
    expect(() =>
      parseClubSetup({
        ...body(),
        academyTeams: Array(21).fill(body().academyTeams[0]),
      }),
    ).toThrow();
    const staff = {
      key: 'person',
      name: 'Kişi',
      role: 'HEAD_COACH',
      teamKey: 'foreign',
      validFrom: '2026-08-14',
      validTo: '2027-05-23',
    };
    expect(() => parseClubSetup({ ...body(), staff: [staff] })).toThrow();
    expect(() =>
      parseClubSetup({
        ...body(),
        staff: [{ ...staff, teamKey: 'first-team', validTo: '2027-05-24' }],
      }),
    ).toThrow();
  });
  it('permits same-name people with distinct explicit row identities', () => {
    const person = {
      key: 'person-1',
      name: 'Aynı Ad',
      role: 'HEAD_COACH',
      teamKey: 'first-team',
      validFrom: '2026-08-14',
      validTo: '2027-05-23',
    };
    expect(
      parseClubSetup({
        ...body(),
        staff: [person, { ...person, key: 'person-2' }],
      }).staff,
    ).toHaveLength(2);
    expect(() =>
      parseClubSetup({ ...body(), staff: [person, person] }),
    ).toThrow();
  });
  it('validates color tokens and rejects active/mismatched/oversized logos', () => {
    expect(parseBrandColor('#AbCDEF')).toBe('#abcdef');
    for (const value of ['red', '#fff', 'url(x)', '#123456;'])
      expect(() => parseBrandColor(value)).toThrow();
    expect(parseSetupLogo(null)).toBeNull();
    for (const value of [
      'https://example.test/logo.png',
      'data:image/svg+xml;base64,PHN2Zz4=',
      'data:image/png;base64,aGVsbG8=',
      `data:image/png;base64,${'a'.repeat(66_000)}`,
    ])
      expect(() => parseSetupLogo(value)).toThrow();
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    expect(parseSetupLogo(png)).toBe(png);
  });
});
