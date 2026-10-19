import { BadRequestException } from '@nestjs/common';
import { groupIdentifier } from './group.dto';

export function parseMemberPageQuery(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid member page query');
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some((key) => !['limit', 'after'].includes(key)))
    throw new BadRequestException('Unknown member page field');
  const limit = value.limit === undefined ? '25' : value.limit;
  if (
    typeof limit !== 'string' ||
    !/^[1-9][0-9]{0,2}$/.test(limit) ||
    +limit > 100
  )
    throw new BadRequestException('limit must be between 1 and 100');
  if (
    value.after !== undefined &&
    (typeof value.after !== 'string' ||
      value.after.length > 160 ||
      value.after.trim() !== value.after ||
      [...value.after].some(
        (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
      ))
  )
    throw new BadRequestException('Invalid member cursor');
  return {
    limit: +limit,
    after:
      value.after === undefined
        ? undefined
        : groupIdentifier(value.after, 'after'),
  };
}
