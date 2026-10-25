import { BadRequestException } from '@nestjs/common';

export function editorReadIdentifier(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.length ||
    value.length > 160 ||
    value.trim() !== value ||
    [...value].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127)
  )
    throw new BadRequestException('Invalid editor resource identifier');
  return value;
}

export function assertEditorReadQuery(input: unknown): void {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).length !== 0
  )
    throw new BadRequestException('Editor reads do not accept query fields');
}
