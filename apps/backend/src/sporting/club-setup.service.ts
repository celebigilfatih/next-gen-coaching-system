import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PrismaService } from '../prisma/prisma.service';
import {
  legacyWrite,
  syncLegacyGroup,
  syncLegacySeason,
} from './legacy-compatibility';
import {
  parseClubSetup,
  setupMidnight,
  setupRequestId,
  type SetupStaffRole,
} from './dto/club-setup.dto';

export type ClubSetupResult = {
  state: 'completed';
  clubId: string;
  clubName: string;
  clubSeasonId: string;
  firstTeamId: string;
  teamCount: number;
  staffCount: number;
};
const roleNames: Record<SetupStaffRole, string> = {
  HEAD_COACH: 'Başantrenör',
  ASSISTANT_COACH: 'Yardımcı antrenör',
  GOALKEEPER_COACH: 'Kaleci antrenörü',
  FITNESS_COACH: 'Kondisyon antrenörü',
  ANALYST: 'Analist',
};
const operation = 'CLUB_SETUP_V1';

@Injectable()
export class ClubSetupService {
  private readonly logger = new Logger(ClubSetupService.name);
  constructor(private readonly prisma: PrismaService) {}

  private identity(principal: AuthPrincipal, requestId: string) {
    if (principal.role !== 'SYSTEM_ADMIN') throw new ForbiddenException();
    const digest = createHash('sha256')
      .update(`${operation}:${principal.id}:${setupRequestId(requestId)}`)
      .digest();
    return {
      clubId: `setup_club_${digest.toString('hex')}`,
      auditId: `setup_audit_${digest.toString('hex')}`,
      lockA: digest.readInt32BE(0),
      lockB: digest.readInt32BE(4),
    };
  }

  private async locked<T>(
    principal: AuthPrincipal,
    requestId: string,
    work: (
      tx: Prisma.TransactionClient,
      identity: ReturnType<ClubSetupService['identity']>,
    ) => Promise<T>,
  ) {
    const identity = this.identity(principal, requestId);
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${identity.lockA}::int, ${identity.lockB}::int)`;
        await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${principal.id} FOR SHARE`;
        const actor = await tx.user.findUnique({
          where: { id: principal.id },
          select: { role: true, status: true },
        });
        if (actor?.role !== 'SYSTEM_ADMIN' || actor.status !== 'ACTIVE')
          throw new ForbiddenException();
        return work(tx, identity);
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('CLUB_SETUP_FAILED');
      throw new InternalServerErrorException(
        'Kurulum sonucu doğrulanamadı. Aynı isteğin durumunu kontrol edin.',
      );
    }
  }

  private async saved(
    tx: Prisma.TransactionClient,
    identity: ReturnType<ClubSetupService['identity']>,
    actorId: string,
  ) {
    const record = await tx.securityAuditEvent.findUnique({
      where: { id: identity.auditId },
    });
    if (!record) {
      if (
        await tx.club.findUnique({
          where: { id: identity.clubId },
          select: { id: true },
        })
      )
        throw new ConflictException(
          'Kurulumun sonuç kaydı eksik; mevcut kulübü yeniden oluşturmayın.',
        );
      return null;
    }
    const metadata = record.metadata as {
      operation?: string;
      requestHash?: string;
      result?: ClubSetupResult;
    } | null;
    if (
      record.action !== 'SPORTING_TEAM_CREATED' ||
      record.actorId !== actorId ||
      record.clubId !== identity.clubId ||
      metadata?.operation !== operation ||
      !metadata.result ||
      metadata.result.clubId !== identity.clubId
    )
      throw new ConflictException(
        'Kurulum kaydı doğrulanamadı; yeniden oluşturmayın.',
      );
    if (
      !(await tx.club.findUnique({
        where: { id: identity.clubId },
        select: { id: true },
      }))
    )
      throw new ConflictException('Kurulumun kulüp kaydı artık bulunamıyor.');
    return { hash: metadata.requestHash, result: metadata.result };
  }

  status(principal: AuthPrincipal, requestId: string) {
    return this.locked(principal, requestId, async (tx, identity) => {
      const saved = await this.saved(tx, identity, principal.id);
      return saved?.result ?? { state: 'not-found' as const };
    });
  }

  create(principal: AuthPrincipal, input: unknown) {
    if (principal.role !== 'SYSTEM_ADMIN') throw new ForbiddenException();
    const body = parseClubSetup(input);
    const { requestId, ...payload } = body;
    const requestHash = createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex');
    return this.locked(principal, requestId, async (tx, identity) => {
      const saved = await this.saved(tx, identity, principal.id);
      if (saved) {
        if (saved.hash !== requestHash)
          throw new ConflictException(
            'Bu istek farklı bilgilerle tamamlanmış. Önce kayıtlı sonucu kontrol edin.',
          );
        return saved.result;
      }
      if (
        await tx.club.findUnique({
          where: { id: identity.clubId },
          select: { id: true },
        })
      )
        throw new ConflictException(
          'Kurulum kimliği kullanılıyor; mevcut kaydı değiştirmeyin.',
        );
      const club = await tx.club.create({
        data: {
          id: identity.clubId,
          ...body.club,
          description: body.club.description || null,
        },
      });
      const definitions = [
        { key: 'first-team', ...body.firstTeam },
        ...body.academyTeams,
      ];
      const contexts = new Map<
        string,
        { teamId: string; teamSeasonId: string }
      >();
      let clubSeasonId = '';
      for (const definition of definitions) {
        const first = definition.key === 'first-team';
        const group = await tx.playerGroup.create({
          data: {
            clubId: club.id,
            name: definition.name,
            ageGroup: definition.ageGroupLabel,
            category: first ? 'A_TAKIM' : 'ALT_YAPI',
          },
        });
        const team = await syncLegacyGroup(tx, group);
        const season = await tx.season.create({
          data: {
            clubId: club.id,
            groupId: group.id,
            name: body.season.name,
            startDate: setupMidnight(body.season.startDate),
            endDate: setupMidnight(body.season.endDate),
            userId: principal.id,
          },
        });
        const teamSeasonId = await syncLegacySeason(tx, season);
        const teamSeason = await tx.teamSeason.findUniqueOrThrow({
          where: { id: teamSeasonId },
          select: { clubSeasonId: true },
        });
        clubSeasonId = teamSeason.clubSeasonId;
        contexts.set(definition.key, { teamId: team.id, teamSeasonId });
        if (!first)
          await tx.securityAuditEvent.create({
            data: {
              action: 'SPORTING_TEAM_CREATED',
              actorId: principal.id,
              clubId: club.id,
              metadata: {
                teamId: team.id,
                classification: 'ACADEMY',
                source: operation,
              },
            },
          });
      }
      const roleIds = new Map<SetupStaffRole, string>();
      for (const staff of body.staff) {
        let roleId = roleIds.get(staff.role);
        if (!roleId) {
          const role = await tx.functionalRole.create({
            data: {
              clubId: club.id,
              key: staff.role,
              name: roleNames[staff.role],
              systemKey: staff.role,
            },
          });
          roleId = role.id;
          roleIds.set(staff.role, roleId);
        }
        const person = await tx.person.create({
          data: {
            clubId: club.id,
            displayName: staff.name,
            staffProfile: { create: { title: roleNames[staff.role] } },
          },
        });
        const end = setupMidnight(staff.validTo);
        end.setUTCDate(end.getUTCDate() + 1);
        const context = contexts.get(staff.teamKey)!;
        const assignment = await tx.sportingAssignment.create({
          data: {
            clubId: club.id,
            personId: person.id,
            teamId: context.teamId,
            teamSeasonId: context.teamSeasonId,
            roleDefinitionId: roleId,
            assignmentType: 'STAFF',
            validFrom: setupMidnight(staff.validFrom),
            validTo: end,
            source: operation,
            createdById: principal.id,
          },
        });
        await tx.securityAuditEvent.create({
          data: {
            action: 'SPORTING_ASSIGNMENT_CREATED',
            actorId: principal.id,
            clubId: club.id,
            targetPersonId: person.id,
            metadata: { assignmentId: assignment.id, source: operation },
          },
        });
      }
      const result: ClubSetupResult = {
        state: 'completed',
        clubId: club.id,
        clubName: club.name,
        clubSeasonId,
        firstTeamId: contexts.get('first-team')!.teamId,
        teamCount: definitions.length,
        staffCount: body.staff.length,
      };
      // This is the actual first-team creation audit event, also anchoring the
      // durable request identity/hash. No staff payload or token is retained.
      await tx.securityAuditEvent.create({
        data: {
          id: identity.auditId,
          action: 'SPORTING_TEAM_CREATED',
          actorId: principal.id,
          clubId: club.id,
          metadata: {
            teamId: result.firstTeamId,
            classification: 'FIRST_TEAM',
            operation,
            requestHash,
            result,
          },
        },
      });
      return result;
    });
  }
}
