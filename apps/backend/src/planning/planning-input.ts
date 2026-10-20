import { BadRequestException } from '@nestjs/common';

export const DAY = 86_400_000;
export const kinds = [
  'TRAINING',
  'RECOVERY',
  'TACTICAL',
  'TOPLANTI',
  'REST',
] as const;
export type PlanningKind = (typeof kinds)[number];
export function object(input: unknown, fields: string[]) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Geçerli bir planlama nesnesi gerekli.');
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((key) => !fields.includes(key)))
    throw new BadRequestException('Desteklenmeyen planlama alanı.');
  return body;
}
export function text(value: unknown, max = 128, optional = false): string {
  if (optional && value == null) return '';
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (!optional && !value.trim())
  )
    throw new BadRequestException('Geçerli bir metin gerekli.');
  return value.trim();
}
export function requestId(value: unknown) {
  const id = text(value);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  )
    throw new BadRequestException('Geçerli istek kimliği gerekli.');
  return id.toLowerCase();
}
export function instant(value: unknown) {
  const str = text(value, 40);
  if (
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(
      str,
    ) ||
    !Number.isFinite(Date.parse(str))
  )
    throw new BadRequestException('Saat dilimi içeren geçerli tarih gerekli.');
  const day = str.slice(0, 10);
  if (new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) !== day)
    throw new BadRequestException('Geçersiz takvim günü.');
  return new Date(str).toISOString();
}
export function dayKey(date: Date | string) {
  return new Date(new Date(date).getTime() + 3 * 3_600_000)
    .toISOString()
    .slice(0, 10);
}
export function midnight(day: string) {
  return new Date(`${day}T00:00:00+03:00`);
}
export function dateKey(value: unknown) {
  const key = text(value, 10);
  if (
    !/^\d{4}-\d\d-\d\d$/.test(key) ||
    !Number.isFinite(midnight(key).getTime()) ||
    dayKey(midnight(key)) !== key
  )
    throw new BadRequestException('Geçerli takvim günü gerekli.');
  return key;
}
export type ProgramInput = ReturnType<typeof programInput>;
export function programInput(input: unknown) {
  const body = object(input, ['weekStart', 'seasonIds', 'overrides']);
  const weekStart = dateKey(body.weekStart);
  if (new Date(`${weekStart}T12:00:00Z`).getUTCDay() !== 1)
    throw new BadRequestException('Hafta pazartesi başlamalıdır.');
  if (
    !Array.isArray(body.seasonIds) ||
    !body.seasonIds.length ||
    body.seasonIds.length > 21
  )
    throw new BadRequestException('1–21 takım sezonu seçin.');
  const seasonIds = body.seasonIds.map((id) => text(id)).sort();
  if (new Set(seasonIds).size !== seasonIds.length)
    throw new BadRequestException('Aynı takım sezonu tekrar seçilemez.');
  const rows = body.overrides ?? [];
  if (!Array.isArray(rows) || rows.length > 500)
    throw new BadRequestException('Çok fazla program değişikliği.');
  const overrides = rows
    .map((row) => {
      const item = object(row, ['key', 'excluded', 'startsAt']);
      if (item.excluded !== undefined && typeof item.excluded !== 'boolean')
        throw new BadRequestException('Geçersiz satır seçimi.');
      return {
        key: text(item.key, 200),
        excluded: item.excluded === true,
        ...(item.startsAt === undefined
          ? {}
          : { startsAt: instant(item.startsAt) }),
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));
  if (new Set(overrides.map((row) => row.key)).size !== overrides.length)
    throw new BadRequestException('Tekrarlanan program satırı.');
  return { weekStart, seasonIds, overrides };
}
export function eventInput(input: unknown, creating = true) {
  const body = object(input, [
    'requestId',
    'seasonId',
    'kind',
    'title',
    'startsAt',
    'duration',
    'notes',
    'location',
    'topic',
  ]);
  if (!kinds.includes(body.kind as PlanningKind))
    throw new BadRequestException('Geçersiz etkinlik türü.');
  if (
    typeof body.duration !== 'number' ||
    !Number.isInteger(body.duration) ||
    (body.duration < 20 &&
      ['TRAINING', 'TACTICAL', 'RECOVERY'].includes(String(body.kind))) ||
    Number(body.duration) < 1 ||
    Number(body.duration) > 480
  )
    throw new BadRequestException(
      'Süre 1–480 dakika; fiziksel seans en az 20 dakika olmalı.',
    );
  return {
    ...(creating ? { requestId: requestId(body.requestId) } : {}),
    seasonId: text(body.seasonId),
    kind: body.kind as PlanningKind,
    title: text(body.title, 120),
    startsAt: instant(body.startsAt),
    duration: body.duration as number,
    notes: text(body.notes, 3000, true),
    location: text(body.location, 200, true),
    topic: text(body.topic, 500, true),
  };
}
