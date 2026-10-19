import { BadRequestException } from '@nestjs/common';
import { isISO8601 } from 'class-validator';
import type { Prisma } from '@prisma/client';

export function seasonBody(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Invalid season resource body');
  return input as Record<string, unknown>;
}

export function stringField(value: unknown, field: string): string {
  if (typeof value !== 'string')
    throw new BadRequestException(`${field} must be a string`);
  return value;
}

export function idField(value: unknown, field: string): string {
  const result = stringField(value, field);
  if (!result) throw new BadRequestException(`${field} is required`);
  return result;
}

export function nullableString(value: unknown, field: string) {
  return value == null ? value : stringField(value, field);
}

export function intField(value: unknown, field: string): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < -2147483648 ||
    value > 2147483647
  )
    throw new BadRequestException(`${field} must be a 32-bit integer`);
  return value;
}

export function nullableInt(value: unknown, field: string) {
  return value == null ? value : intField(value, field);
}

export function seasonDate(value: unknown, field: string): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  // These routes already convert date-only and local/offset ISO strings with Date.
  if (
    typeof value === 'string' &&
    value.trim() === value &&
    isISO8601(value, { strict: true }) &&
    Number.isFinite(Date.parse(value))
  )
    return new Date(value);
  throw new BadRequestException(`${field} must be a valid date`);
}

function isJson(
  value: unknown,
  parents = new Set<object>(),
): value is Prisma.JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || parents.has(value)) return false;
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  )
    return false;
  parents.add(value);
  const valid = Object.values(value).every((entry) => isJson(entry, parents));
  parents.delete(value);
  return valid;
}

export function jsonField(
  value: unknown,
  field: string,
): Prisma.JsonValue | undefined {
  if (value === undefined) return undefined;
  try {
    if (isJson(value)) return value;
  } catch {
    /* Reject cyclic or unrepresentable internal inputs. */
  }
  throw new BadRequestException(`${field} must be JSON`);
}
