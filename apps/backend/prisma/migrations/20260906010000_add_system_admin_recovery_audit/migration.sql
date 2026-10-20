-- This additive enum value is intentionally retained on application rollback so
-- historical break-glass recovery events remain readable.
ALTER TYPE "SecurityAuditAction" ADD VALUE 'SYSTEM_ADMIN_RECOVERED';
