export const staffRoles = [
  { key: 'HEAD_COACH', name: 'Başantrenör' },
  { key: 'ASSISTANT_COACH', name: 'Yardımcı antrenör' },
  { key: 'GOALKEEPER_COACH', name: 'Kaleci antrenörü' },
  { key: 'FITNESS_COACH', name: 'Kondisyon antrenörü' },
  { key: 'ANALYST', name: 'Analist' },
] as const;
export type SetupStaffRole = (typeof staffRoles)[number]['key'];
export type SetupTeam = { key: string; name: string; ageGroupLabel: string };
export type SetupStaff = {
  key: string;
  name: string;
  role: SetupStaffRole;
  teamKey: string;
  validFrom: string;
  validTo: string;
};
export type ClubSetupDraft = {
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
  staff: SetupStaff[];
};
export type ClubSetupPayload = ClubSetupDraft & { requestId: string };
export type ClubSetupResult = {
  state: 'completed';
  clubId: string;
  clubName: string;
  clubSeasonId: string;
  firstTeamId: string;
  teamCount: number;
  staffCount: number;
};
export type ClubSetupStatus = ClubSetupResult | { state: 'not-found' };
export const setupRequestPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function newSetupDraft(): ClubSetupDraft {
  return {
    club: {
      name: '',
      description: '',
      logo: null,
      primaryColor: '#0878ed',
      secondaryColor: '#0a203b',
    },
    season: { name: '', startDate: '', endDate: '' },
    firstTeam: { name: 'A Takım', ageGroupLabel: 'SENIOR' },
    academyTeams: [],
    staff: [],
  };
}
export function setupErrors(
  draft: ClubSetupDraft,
  step: number,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const required = (id: string, text: string, max = 80) => {
    if (
      !text.trim() ||
      text.normalize('NFKC').trim().length > max ||
      /\p{Cc}/u.test(text)
    )
      errors[id] = `1–${max} karakter girin.`;
  };
  if (step === 0) {
    required('club-name', draft.club.name);
    if (
      draft.club.description.length > 500 ||
      /\p{Cc}/u.test(draft.club.description)
    )
      errors['club-description'] =
        'En fazla 500 karakter girin; satır sonu kullanmayın.';
    for (const field of ['primaryColor', 'secondaryColor'] as const)
      if (!/^#[0-9a-f]{6}$/i.test(draft.club[field]))
        errors[field] = '#RRGGBB biçiminde bir renk girin.';
  }
  if (step === 1) {
    required('season-name', draft.season.name);
    for (const [id, day] of [
      ['season-start', draft.season.startDate],
      ['season-end', draft.season.endDate],
    ]) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
        day < '1900-01-01' ||
        !Number.isFinite(Date.parse(day)) ||
        new Date(day).toISOString().slice(0, 10) !== day
      )
        errors[id] = 'Geçerli bir tarih seçin.';
    }
    if (!errors['season-start'] && !errors['season-end']) {
      const duration =
        Date.parse(draft.season.endDate) - Date.parse(draft.season.startDate);
      if (duration < 0 || Math.floor(duration / (7 * 86_400_000)) + 1 > 80)
        errors['season-end'] =
          'Bitiş başlangıçtan önce olamaz; sezon en fazla 80 haftadır.';
    }
  }
  if (step === 2) {
    required('first-name', draft.firstTeam.name);
    required('first-age', draft.firstTeam.ageGroupLabel, 32);
    const names = new Set([
      draft.firstTeam.name.normalize('NFKC').trim().toLocaleLowerCase('tr-TR'),
    ]);
    for (const team of draft.academyTeams) {
      required(`name-${team.key}`, team.name);
      required(`age-${team.key}`, team.ageGroupLabel, 32);
      const name = team.name
        .normalize('NFKC')
        .trim()
        .toLocaleLowerCase('tr-TR');
      if (names.has(name))
        errors[`name-${team.key}`] = 'Takım adı zaten kullanılıyor.';
      names.add(name);
    }
  }
  if (step === 3)
    for (const staff of draft.staff) {
      required(`staff-${staff.key}`, staff.name);
      if (
        !['first-team', ...draft.academyTeams.map((team) => team.key)].includes(
          staff.teamKey,
        )
      )
        errors[`team-${staff.key}`] = 'Oluşturulacak bir takım seçin.';
      if (
        !staff.validFrom ||
        !staff.validTo ||
        staff.validFrom > staff.validTo ||
        staff.validFrom < draft.season.startDate ||
        staff.validTo > draft.season.endDate
      )
        errors[`from-${staff.key}`] = 'Görev tarihleri sezon içinde olmalıdır.';
    }
  return errors;
}

export function validSetupResult(value: ClubSetupStatus): ClubSetupStatus {
  if (value?.state === 'not-found') return value;
  if (
    value?.state !== 'completed' ||
    !value.clubId ||
    !value.clubSeasonId ||
    !value.firstTeamId ||
    !value.clubName ||
    !Number.isInteger(value.teamCount) ||
    value.teamCount < 1 ||
    !Number.isInteger(value.staffCount) ||
    value.staffCount < 0
  )
    throw new Error('Kurulum sonucu doğrulanamadı. Sonucu kontrol edin.');
  return value;
}
