import { createHash } from 'node:crypto';
import { ConflictException } from '@nestjs/common';

export function isV2(value: unknown): boolean {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { schemaVersion?: unknown }).schemaVersion === 2
  );
}

/** Fail closed even for malformed V2; never reduce saved scenes to V1. */
export function assertLegacyTacticalWrite(value: unknown): void {
  if (isV2(value))
    throw new ConflictException('TACTICAL_DOCUMENT_VERSION_CONFLICT');
}

/** Old clients must not interpret a V2 payload as an empty V1 board. */
export function assertLegacyTacticalRead<T>(value: T): T {
  if (Array.isArray(value)) value.forEach(assertLegacyTacticalRead);
  else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (['jsonData', 'boardSnapshot', 'tacticalBoard'].includes(key)) {
        assertLegacyTacticalWrite(child);
      } else if (child && typeof child === 'object')
        assertLegacyTacticalRead(child);
    }
  }
  return value;
}

function canonical(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function tacticalWriteToken(
  identity: unknown,
  document: unknown,
): string {
  return `td1_${createHash('sha256').update(canonical({ identity, document })).digest('hex')}`;
}

export function isSerializationConflict(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as { code?: unknown }).code === 'P2034'
  );
}

export function rethrowTacticalConflict(error: unknown): void {
  if (isSerializationConflict(error))
    throw new ConflictException('TACTICAL_DOCUMENT_WRITE_CONFLICT');
}
