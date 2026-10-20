import { BadRequestException } from '@nestjs/common';

export function parseAgeLabel(value: unknown, field = 'ageGroup'): string {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    value.length < 1 ||
    value.length > 32 ||
    [...value].some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    )
  ) {
    throw new BadRequestException(
      `${field} must contain 1 to 32 trimmed characters`,
    );
  }
  return value.normalize('NFKC');
}
