import { BadRequestException } from '@nestjs/common';
import { validateTacticalDocument } from './tactical-document-core';

/** BL-058a opt-in boundary. Not wired to legacy HTTP writers. */
export function validateVersionedTacticalDocument(value: unknown) {
  try {
    return validateTacticalDocument(value);
  } catch {
    // Never reflect untrusted names, body data or exception causes.
    throw new BadRequestException('Invalid tactical document');
  }
}
