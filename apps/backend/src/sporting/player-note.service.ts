import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, SportingCapability } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  encodeNoteCursor,
  parseActivityPage,
  parseCreatePlayerNote,
  parsePlayerNotePage,
  parseShareBody,
  parseUpdatePlayerNote,
  parseVersionBody,
} from './dto/player-note.dto';
import { sportingIdentifier } from './dto/sporting.dto';

const noteSelect = {
  id: true,
  clubId: true,
  personId: true,
  originTeamId: true,
  authorId: true,
  category: true,
  body: true,
  observedAt: true,
  followUpAt: true,
  followUpStatus: true,
  version: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
  originTeam: { select: { id: true, name: true } },
  author: { select: { id: true, name: true } },
  teamGrants: {
    orderBy: { createdAt: 'asc' as const },
    select: { team: { select: { id: true, name: true } } },
  },
} satisfies Prisma.PlayerNoteSelect;

type NoteRecord = Prisma.PlayerNoteGetPayload<{ select: typeof noteSelect }>;

@Injectable()
export class PlayerNoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async page(principal: AuthPrincipal, personIdInput: unknown, input: unknown) {
    const person = await this.requirePerson(personIdInput);
    const access = await this.noteAccess(
      principal,
      person.clubId,
      'PLAYER_NOTE_VIEW',
    );
    const query = parsePlayerNotePage(input);
    const filters: Prisma.PlayerNoteWhereInput[] = [];
    if (query.teamId)
      filters.push({
        OR: [
          { originTeamId: query.teamId },
          { teamGrants: { some: { teamId: query.teamId } } },
        ],
      });
    const scoped = this.noteScope(access);
    if (Object.keys(scoped).length) filters.push(scoped);
    const baseWhere: Prisma.PlayerNoteWhereInput = {
      personId: person.id,
      clubId: person.clubId,
      archivedAt: query.status === 'ARCHIVED' ? { not: null } : null,
      ...(query.q ? { body: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.followUpStatus ? { followUpStatus: query.followUpStatus } : {}),
      ...(filters.length ? { AND: filters } : {}),
    };
    const where: Prisma.PlayerNoteWhereInput = query.after
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { observedAt: { lt: new Date(query.after.observedAt) } },
                {
                  observedAt: new Date(query.after.observedAt),
                  id: { lt: query.after.id },
                },
              ],
            },
          ],
        }
      : baseWhere;
    const [rows, total, openFollowUps] = await Promise.all([
      this.prisma.playerNote.findMany({
        where,
        take: query.limit + 1,
        orderBy: [{ observedAt: 'desc' }, { id: 'desc' }],
        select: noteSelect,
      }),
      this.prisma.playerNote.count({ where: baseWhere }),
      this.prisma.playerNote.count({
        where: {
          personId: person.id,
          clubId: person.clubId,
          archivedAt: null,
          followUpStatus: 'OPEN',
          ...this.noteScope(access),
        },
      }),
    ]);
    const items = rows.slice(0, query.limit);
    return {
      items: items.map((note) => this.present(note, principal, access)),
      nextCursor:
        rows.length > query.limit
          ? encodeNoteCursor(items[items.length - 1])
          : null,
      limit: query.limit,
      total,
      summary: { openFollowUps },
      permissions: {
        canCreate: access.canManage,
        canShare: access.isAdmin,
      },
    };
  }

  async create(
    principal: AuthPrincipal,
    personIdInput: unknown,
    input: unknown,
  ) {
    const person = await this.requirePerson(personIdInput);
    const data = parseCreatePlayerNote(input);
    const team = await this.requireTeam(data.originTeamId);
    if (team.clubId !== person.clubId) this.deny();
    const access = await this.noteAccess(
      principal,
      person.clubId,
      'PLAYER_NOTE_MANAGE',
    );
    if (!access.canManage || !this.teamAllowed(access, team.id)) this.deny();
    const targetAssigned = await this.hasActiveAssignment(person.id, team.id);
    if (!targetAssigned) this.deny();
    const created = await this.prisma.$transaction(async (tx) => {
      const note = await tx.playerNote.create({
        data: {
          clubId: person.clubId,
          personId: person.id,
          authorId: principal.id,
          ...data,
        },
      });
      await tx.playerNoteRevision.create({
        data: {
          noteId: note.id,
          version: note.version,
          category: note.category,
          body: note.body,
          observedAt: note.observedAt,
          followUpAt: note.followUpAt,
          followUpStatus: note.followUpStatus,
          editedById: principal.id,
        },
      });
      await this.audit(tx, 'PLAYER_NOTE_CREATED', principal, note, {
        category: note.category,
      });
      return note.id;
    });
    return this.getVisibleNote(principal, person, created);
  }

  async update(
    principal: AuthPrincipal,
    personIdInput: unknown,
    noteIdInput: unknown,
    input: unknown,
  ) {
    const person = await this.requirePerson(personIdInput);
    const noteId = sportingIdentifier(noteIdInput, 'noteId');
    const data = parseUpdatePlayerNote(input);
    return this.changeNote(
      principal,
      person,
      noteId,
      data.expectedVersion,
      async (tx, note) => {
        const nextVersion = note.version + 1;
        const updated = await tx.playerNote.updateMany({
          where: { id: note.id, version: data.expectedVersion },
          data: {
            category: data.category,
            body: data.body,
            observedAt: data.observedAt,
            followUpAt: data.followUpAt,
            followUpStatus: data.followUpStatus,
            version: nextVersion,
          },
        });
        if (updated.count !== 1) this.conflict();
        await tx.playerNoteRevision.create({
          data: {
            noteId: note.id,
            version: nextVersion,
            category: data.category,
            body: data.body,
            observedAt: data.observedAt,
            followUpAt: data.followUpAt,
            followUpStatus: data.followUpStatus,
            editedById: principal.id,
          },
        });
        await this.audit(tx, 'PLAYER_NOTE_UPDATED', principal, note, {
          category: data.category,
          version: nextVersion,
        });
      },
    );
  }

  async archive(
    principal: AuthPrincipal,
    personId: unknown,
    noteId: unknown,
    input: unknown,
  ) {
    return this.changeArchiveState(principal, personId, noteId, input, true);
  }

  async restore(
    principal: AuthPrincipal,
    personId: unknown,
    noteId: unknown,
    input: unknown,
  ) {
    return this.changeArchiveState(principal, personId, noteId, input, false);
  }

  async revisions(
    principal: AuthPrincipal,
    personIdInput: unknown,
    noteIdInput: unknown,
    input: unknown,
  ) {
    const person = await this.requirePerson(personIdInput);
    const note = await this.getVisibleNote(
      principal,
      person,
      sportingIdentifier(noteIdInput, 'noteId'),
    );
    const query = parseActivityPage(input);
    const rows = await this.prisma.playerNoteRevision.findMany({
      where: {
        noteId: note.id,
        ...(query.after
          ? {
              OR: [
                { createdAt: { lt: new Date(query.after.observedAt) } },
                {
                  createdAt: new Date(query.after.observedAt),
                  id: { lt: query.after.id },
                },
              ],
            }
          : {}),
      },
      take: query.limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { editedBy: { select: { id: true, name: true } } },
    });
    const items = rows.slice(0, query.limit);
    return {
      items,
      nextCursor:
        rows.length > query.limit
          ? encodeNoteCursor({
              id: items[items.length - 1].id,
              observedAt: items[items.length - 1].createdAt,
            })
          : null,
      limit: query.limit,
    };
  }

  async replaceShares(
    principal: AuthPrincipal,
    personIdInput: unknown,
    noteIdInput: unknown,
    input: unknown,
  ) {
    const person = await this.requirePerson(personIdInput);
    if (principal.role !== 'SYSTEM_ADMIN' && principal.role !== 'CLUB_ADMIN')
      this.deny();
    if (principal.role === 'CLUB_ADMIN' && principal.clubId !== person.clubId)
      this.deny();
    const noteId = sportingIdentifier(noteIdInput, 'noteId');
    const data = parseShareBody(input);
    const note = await this.requireNote(person, noteId);
    if (data.teamIds.includes(note.originTeamId)) this.deny();
    const teams = await this.prisma.team.findMany({
      where: {
        id: { in: data.teamIds },
        clubId: person.clubId,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (teams.length !== data.teamIds.length) this.deny();
    for (const teamId of data.teamIds) {
      if (!(await this.hasActiveAssignment(person.id, teamId))) this.deny();
    }
    await this.prisma.$transaction(async (tx) => {
      const nextVersion = note.version + 1;
      const updated = await tx.playerNote.updateMany({
        where: { id: note.id, version: data.expectedVersion },
        data: { version: nextVersion },
      });
      if (updated.count !== 1) this.conflict();
      await tx.playerNoteTeamGrant.deleteMany({ where: { noteId: note.id } });
      if (data.teamIds.length)
        await tx.playerNoteTeamGrant.createMany({
          data: data.teamIds.map((teamId) => ({
            noteId: note.id,
            teamId,
            grantedById: principal.id,
          })),
        });
      await tx.playerNoteRevision.create({
        data: {
          noteId: note.id,
          version: nextVersion,
          category: note.category,
          body: note.body,
          observedAt: note.observedAt,
          followUpAt: note.followUpAt,
          followUpStatus: note.followUpStatus,
          editedById: principal.id,
        },
      });
      await this.audit(tx, 'PLAYER_NOTE_SHARES_CHANGED', principal, note, {
        version: nextVersion,
        teamIds: data.teamIds,
      });
    });
    return this.getVisibleNote(principal, person, note.id);
  }

  async activity(
    principal: AuthPrincipal,
    personIdInput: unknown,
    input: unknown,
  ) {
    const person = await this.requirePerson(personIdInput);
    await this.authorization.assertPersonCapability(
      principal,
      person.id,
      'PLAYER_HISTORY_VIEW',
    );
    const query = parseActivityPage(input);
    const before = query.after ? new Date(query.after.observedAt) : undefined;
    const [assignments, account] = await Promise.all([
      this.prisma.sportingAssignment.findMany({
        where: {
          personId: person.id,
          clubId: person.clubId,
          ...(before ? { validFrom: { lt: before } } : {}),
        },
        take: query.limit + 1,
        orderBy: [{ validFrom: 'desc' }, { id: 'desc' }],
        include: {
          team: { select: { id: true, name: true } },
          roleDefinition: { select: { name: true } },
        },
      }),
      this.prisma.user.findFirst({
        where: { personId: person.id },
        select: { id: true },
      }),
    ]);
    const attendances = account
      ? await this.prisma.attendance.findMany({
          where: {
            playerId: account.id,
            plan: {
              clubId: person.clubId,
              ...(before
                ? { OR: [{ date: { lt: before } }, { date: null }] }
                : {}),
            },
          },
          take: query.limit + 1,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          include: {
            plan: {
              select: {
                id: true,
                title: true,
                date: true,
                group: {
                  select: {
                    team: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        })
      : [];
    const combined = [
      ...assignments.map((assignment) => ({
        id: `assignment:${assignment.id}`,
        cursorId: assignment.id,
        kind: 'ASSIGNMENT' as const,
        occurredAt: assignment.validFrom,
        title: assignment.team?.name ?? assignment.roleDefinition.name,
        detail: assignment.roleDefinition.name,
        status: assignment.assignmentType,
        source: assignment.source,
        team: assignment.team,
        link: assignment.team ? `/app/teams/${assignment.team.id}` : null,
      })),
      ...attendances.map((attendance) => ({
        id: `attendance:${attendance.id}`,
        cursorId: attendance.id,
        kind: 'TRAINING_ATTENDANCE' as const,
        occurredAt: attendance.plan.date ?? attendance.createdAt,
        title: attendance.plan.title,
        detail: 'Antrenman katılımı',
        status: attendance.status,
        source: 'NGCS_ATTENDANCE',
        team: attendance.plan.group?.team ?? null,
        link: `/app/trainings/${attendance.plan.id}`,
      })),
    ]
      .filter(
        (item) =>
          !query.after ||
          item.occurredAt < new Date(query.after.observedAt) ||
          (item.occurredAt.getTime() ===
            new Date(query.after.observedAt).getTime() &&
            item.cursorId < query.after.id),
      )
      .sort(
        (a, b) =>
          b.occurredAt.getTime() - a.occurredAt.getTime() ||
          b.cursorId.localeCompare(a.cursorId),
      );
    const items = combined.slice(0, query.limit);
    return {
      items,
      nextCursor:
        combined.length > query.limit
          ? encodeNoteCursor({
              id: items[items.length - 1].cursorId,
              observedAt: items[items.length - 1].occurredAt,
            })
          : null,
      limit: query.limit,
    };
  }

  private async changeArchiveState(
    principal: AuthPrincipal,
    personIdInput: unknown,
    noteIdInput: unknown,
    input: unknown,
    archive: boolean,
  ) {
    const person = await this.requirePerson(personIdInput);
    const noteId = sportingIdentifier(noteIdInput, 'noteId');
    const data = parseVersionBody(input);
    return this.changeNote(
      principal,
      person,
      noteId,
      data.expectedVersion,
      async (tx, note) => {
        if (Boolean(note.archivedAt) === archive)
          throw new ConflictException(
            archive ? 'Note is already archived' : 'Note is already active',
          );
        const nextVersion = note.version + 1;
        const updated = await tx.playerNote.updateMany({
          where: { id: note.id, version: data.expectedVersion },
          data: {
            archivedAt: archive ? new Date() : null,
            version: nextVersion,
          },
        });
        if (updated.count !== 1) this.conflict();
        await tx.playerNoteRevision.create({
          data: {
            noteId: note.id,
            version: nextVersion,
            category: note.category,
            body: note.body,
            observedAt: note.observedAt,
            followUpAt: note.followUpAt,
            followUpStatus: note.followUpStatus,
            editedById: principal.id,
          },
        });
        await this.audit(
          tx,
          archive ? 'PLAYER_NOTE_ARCHIVED' : 'PLAYER_NOTE_RESTORED',
          principal,
          note,
          { version: nextVersion, category: note.category },
        );
      },
    );
  }

  private async changeNote(
    principal: AuthPrincipal,
    person: { id: string; clubId: string },
    noteId: string,
    expectedVersion: number,
    mutation: (tx: Prisma.TransactionClient, note: NoteRecord) => Promise<void>,
  ) {
    const note = await this.requireNote(person, noteId);
    const access = await this.noteAccess(
      principal,
      person.clubId,
      'PLAYER_NOTE_MANAGE',
    );
    if (
      !access.canManage ||
      (!access.isAdmin && note.authorId !== principal.id) ||
      (!access.isAdmin &&
        !this.teamAllowed(
          access,
          note.originTeamId,
          note.teamGrants.map((grant) => grant.team.id),
        ))
    )
      this.deny();
    if (note.version !== expectedVersion) this.conflict();
    await this.prisma.$transaction((tx) => mutation(tx, note));
    return this.getVisibleNote(principal, person, note.id);
  }

  private async getVisibleNote(
    principal: AuthPrincipal,
    person: { id: string; clubId: string },
    noteId: string,
  ) {
    const access = await this.noteAccess(
      principal,
      person.clubId,
      'PLAYER_NOTE_VIEW',
    );
    const note = await this.requireNote(person, noteId);
    if (
      !access.isAdmin &&
      !this.teamAllowed(
        access,
        note.originTeamId,
        note.teamGrants.map((grant) => grant.team.id),
      )
    )
      this.deny();
    return this.present(note, principal, access);
  }

  private present(
    note: NoteRecord,
    principal: AuthPrincipal,
    access: NoteAccess,
  ) {
    return {
      ...note,
      teamGrants: note.teamGrants.map((grant) => grant.team),
      permissions: {
        canEdit:
          access.canManage &&
          (access.isAdmin || note.authorId === principal.id),
        canArchive:
          access.canManage &&
          (access.isAdmin || note.authorId === principal.id),
        canShare: access.isAdmin,
      },
    };
  }

  private async requirePerson(value: unknown) {
    const id = sportingIdentifier(value, 'personId');
    const person = await this.prisma.person.findUnique({
      where: { id },
      select: {
        id: true,
        clubId: true,
        playerProfile: { select: { personId: true } },
      },
    });
    if (!person?.playerProfile) throw new NotFoundException('Player not found');
    return person;
  }

  private async requireTeam(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      select: { id: true, clubId: true, archivedAt: true },
    });
    if (!team || team.archivedAt) throw new NotFoundException('Team not found');
    return team;
  }

  private async requireNote(
    person: { id: string; clubId: string },
    noteId: string,
  ) {
    const note = await this.prisma.playerNote.findFirst({
      where: { id: noteId, personId: person.id, clubId: person.clubId },
      select: noteSelect,
    });
    if (!note) throw new NotFoundException('Player note not found');
    return note;
  }

  private async hasActiveAssignment(personId: string, teamId: string) {
    const now = new Date();
    return Boolean(
      await this.prisma.sportingAssignment.findFirst({
        where: {
          personId,
          teamId,
          validFrom: { lte: now },
          OR: [{ validTo: null }, { validTo: { gt: now } }],
        },
        select: { id: true },
      }),
    );
  }

  private async noteAccess(
    principal: AuthPrincipal,
    clubId: string,
    capability: SportingCapability,
  ): Promise<NoteAccess> {
    if (principal.role === 'SYSTEM_ADMIN')
      return { isAdmin: true, allTeams: true, teamIds: [], canManage: true };
    if (
      !principal.clubId ||
      principal.clubId !== clubId ||
      principal.role === 'PLAYER'
    )
      this.deny();
    if (principal.role === 'CLUB_ADMIN')
      return { isAdmin: true, allTeams: true, teamIds: [], canManage: true };
    const user = await this.prisma.user.findUnique({
      where: { id: principal.id },
      select: { personId: true },
    });
    if (!user?.personId) this.deny();
    const now = new Date();
    const assignments = await this.prisma.sportingAssignment.findMany({
      where: {
        clubId,
        personId: user.personId,
        validFrom: { lte: now },
        OR: [{ validTo: null }, { validTo: { gt: now } }],
        roleDefinition: { capabilities: { some: { capability } } },
      },
      select: {
        teamId: true,
        roleDefinition: {
          select: { capabilities: { select: { capability: true } } },
        },
      },
    });
    if (!assignments.length) this.deny();
    return {
      isAdmin: false,
      allTeams: assignments.some((item) => !item.teamId),
      teamIds: assignments.flatMap((item) =>
        item.teamId ? [item.teamId] : [],
      ),
      canManage: assignments.some((item) =>
        item.roleDefinition.capabilities.some(
          (entry) => entry.capability === 'PLAYER_NOTE_MANAGE',
        ),
      ),
    };
  }

  private noteScope(access: NoteAccess): Prisma.PlayerNoteWhereInput {
    if (access.allTeams) return {};
    return {
      OR: [
        { originTeamId: { in: access.teamIds } },
        { teamGrants: { some: { teamId: { in: access.teamIds } } } },
      ],
    };
  }

  private teamAllowed(
    access: NoteAccess,
    teamId: string,
    grants: string[] = [],
  ) {
    return (
      access.allTeams ||
      access.teamIds.includes(teamId) ||
      grants.some((id) => access.teamIds.includes(id))
    );
  }

  private audit(
    tx: Prisma.TransactionClient,
    action:
      | 'PLAYER_NOTE_CREATED'
      | 'PLAYER_NOTE_UPDATED'
      | 'PLAYER_NOTE_ARCHIVED'
      | 'PLAYER_NOTE_RESTORED'
      | 'PLAYER_NOTE_SHARES_CHANGED',
    principal: AuthPrincipal,
    note: { id: string; clubId: string; personId: string; version: number },
    metadata: Record<string, unknown>,
  ) {
    return tx.securityAuditEvent.create({
      data: {
        action,
        actorId: principal.id,
        targetPersonId: note.personId,
        clubId: note.clubId,
        metadata: { noteId: note.id, ...metadata },
      },
    });
  }

  private conflict(): never {
    throw new ConflictException('PLAYER_NOTE_VERSION_CONFLICT');
  }

  private deny(): never {
    throw new ForbiddenException('Resource is outside the authorized scope');
  }
}

type NoteAccess = {
  isAdmin: boolean;
  allTeams: boolean;
  teamIds: string[];
  canManage: boolean;
};
