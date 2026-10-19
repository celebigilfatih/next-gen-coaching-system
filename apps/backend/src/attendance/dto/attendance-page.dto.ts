import { parseMemberPageQuery } from '../../groups/dto/member-page.dto';
import { BadRequestException } from '@nestjs/common';

export function parseAttendancePageQuery(input: unknown) {
  // Reuse the bounded ID/cursor grammar without accepting client scope/role.
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid attendance page query');
  const { planId, ...page } = input as Record<string, unknown>;
  const id = parseMemberPageQuery({ after: planId ?? '' }).after!;
  return { planId: id, ...parseMemberPageQuery(page) };
}
