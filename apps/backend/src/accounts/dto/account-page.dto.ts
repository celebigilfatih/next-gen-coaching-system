import { BadRequestException } from '@nestjs/common';
import { AccountStatus, UserRole } from '@prisma/client';

const hasControlCharacter = (value: string) =>
  [...value].some(
    (character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
  );

export function parseAccountPageQuery(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid account page query');
  const query = input as Record<string, unknown>;
  const allowed = ['after', 'limit', 'q', 'role', 'status', 'clubId'];
  if (Object.keys(query).some((key) => !allowed.includes(key)))
    throw new BadRequestException('Unknown account page query field');

  const identifier = (key: 'after' | 'clubId') => {
    const value = query[key];
    if (value === undefined) return undefined;
    if (
      typeof value !== 'string' ||
      !value.length ||
      value.length > 160 ||
      value.trim() !== value ||
      hasControlCharacter(value)
    )
      throw new BadRequestException(`Invalid ${key}`);
    return value;
  };

  const rawLimit = query.limit ?? '25';
  if (
    typeof rawLimit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(rawLimit) ||
    Number(rawLimit) > 100
  )
    throw new BadRequestException('limit must be between 1 and 100');

  const rawSearch = query.q ?? '';
  if (
    typeof rawSearch !== 'string' ||
    rawSearch.length > 100 ||
    hasControlCharacter(rawSearch)
  )
    throw new BadRequestException('Invalid account search');

  const role = query.role;
  if (
    role !== undefined &&
    (!Object.values(UserRole).includes(role as UserRole) ||
      typeof role !== 'string')
  )
    throw new BadRequestException('Invalid account role');

  const status = query.status;
  if (
    status !== undefined &&
    (!Object.values(AccountStatus).includes(status as AccountStatus) ||
      typeof status !== 'string')
  )
    throw new BadRequestException('Invalid account status');

  return {
    after: identifier('after'),
    clubId: identifier('clubId'),
    limit: Number(rawLimit),
    q: rawSearch.trim(),
    role: role as UserRole | undefined,
    status: status as AccountStatus | undefined,
  };
}
