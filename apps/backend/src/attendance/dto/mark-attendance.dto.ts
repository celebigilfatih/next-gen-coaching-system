import { BadRequestException } from '@nestjs/common';

export interface MarkAttendanceDto {
  planId: string;
  playerId: string;
  status: 'PRESENT' | 'ABSENT';
}

export function parseMarkAttendanceBody(body: unknown): MarkAttendanceDto {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Invalid attendance body');
  }
  if (
    !('planId' in body) ||
    typeof body.planId !== 'string' ||
    !body.planId ||
    !('playerId' in body) ||
    typeof body.playerId !== 'string' ||
    !body.playerId ||
    !('status' in body) ||
    (body.status !== 'PRESENT' && body.status !== 'ABSENT')
  ) {
    throw new BadRequestException(
      'planId, playerId and a valid attendance status are required',
    );
  }
  return { planId: body.planId, playerId: body.playerId, status: body.status };
}
