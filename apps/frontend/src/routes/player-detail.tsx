import {
  ArrowLeft,
  CheckCircle,
  ClockCounterClockwise,
  DotsThree,
  NotePencil,
  PencilSimple,
  Plus,
  ShareNetwork,
  ShieldCheck,
  Trash,
  UsersThree,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { AssignmentPageControls } from '../components/assignment-page-controls';
import { AssignmentCatalogSelect } from '../components/assignment-catalog-select';
import { FormField } from '../components/forms/form-field';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { NativeSelect } from '../components/ui/native-select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  archivePlayerNote,
  createPlayerNote,
  createSportingAssignment,
  getPlayerActivityPage,
  getPlayerNotePage,
  getPlayerNoteRevisions,
  getSportingPlayer360Page,
  replacePlayerNoteShares,
  restorePlayerNote,
  transitionSportingPrimary,
  updatePlayerNote,
  type PlayerActivityItem,
  type PlayerNote,
  type PlayerNoteCategory,
  type PlayerNoteFollowUpStatus,
  type PlayerNotePage,
  type SportingAssignmentType,
  type SportingPlayer360,
} from '../lib/api';
import { getSession } from '../lib/session';
import { useAssignmentPage } from '../lib/use-assignment-page';

export function meta() {
  return [{ title: 'Oyuncu Profili | NGCS' }];
}

const profileTabs = ['overview', 'notes', 'activity', 'journey'] as const;
type ProfileTab = (typeof profileTabs)[number];

export default function PlayerDetailRoute() {
  const { personId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const rawTab = params.get('tab');
  const tab = profileTabs.includes(rawTab as ProfileTab)
    ? (rawTab as ProfileTab)
    : 'overview';
  const asOf = params.get('asOf') ?? new Date().toISOString().slice(0, 10);
  const updateQuery = useCallback(
    (changes: Record<string, string | null>) =>
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(changes).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key),
        );
        return next;
      }),
    [setParams],
  );
  return (
    <PlayerDetail
      personId={personId}
      asOf={asOf}
      tab={tab}
      params={params}
      updateQuery={updateQuery}
    />
  );
}

function PlayerDetail({
  personId,
  asOf,
  tab,
  params,
  updateQuery,
}: {
  personId: string;
  asOf: string;
  tab: ProfileTab;
  params: URLSearchParams;
  updateQuery: (changes: Record<string, string | null>) => void;
}) {
  const load = useCallback(
    (after?: string) =>
      getSportingPlayer360Page(personId, {
        asOf: `${asOf}T12:00:00.000Z`,
        after,
      }),
    [asOf, personId],
  );
  const state = useAssignmentPage(load);
  const player = state.data;
  const role = getSession()?.user.role;
  const canViewNotes = role !== 'PLAYER';
  const [notePage, setNotePage] = useState<PlayerNotePage | null>(null);
  const [notesLoading, setNotesLoading] = useState(canViewNotes);
  const [notesLoadingMore, setNotesLoadingMore] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [activities, setActivities] = useState<PlayerActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [editor, setEditor] = useState<PlayerNote | 'new' | null>(null);
  const noteRequest = useRef(0);
  const noteFilters = useMemo(
    () => ({
      q: params.get('q') || undefined,
      category:
        (params.get('category') as PlayerNoteCategory | null) || undefined,
      followUpStatus:
        (params.get('followUpStatus') as PlayerNoteFollowUpStatus | null) ||
        undefined,
      teamId: params.get('teamId') || undefined,
      status:
        params.get('status') === 'ARCHIVED'
          ? ('ARCHIVED' as const)
          : ('ACTIVE' as const),
    }),
    [params],
  );
  const loadNotes = useCallback(async () => {
    if (!canViewNotes) return;
    const id = ++noteRequest.current;
    setNotesLoading(true);
    setNotesError('');
    try {
      const result = await getPlayerNotePage(personId, noteFilters);
      if (id === noteRequest.current) setNotePage(result);
    } catch (cause) {
      if (id === noteRequest.current)
        setNotesError(
          cause instanceof Error ? cause.message : 'Notlar alınamadı.',
        );
    } finally {
      if (id === noteRequest.current) setNotesLoading(false);
    }
  }, [canViewNotes, noteFilters, personId]);
  const loadMoreNotes = useCallback(async () => {
    if (!canViewNotes || !notePage?.nextCursor || notesLoadingMore) return;
    const id = ++noteRequest.current;
    setNotesLoadingMore(true);
    setNotesError('');
    try {
      const result = await getPlayerNotePage(personId, {
        ...noteFilters,
        after: notePage.nextCursor,
      });
      if (id === noteRequest.current) {
        setNotePage((current) =>
          current
            ? {
                ...result,
                items: [...current.items, ...result.items],
              }
            : result,
        );
      }
    } catch (cause) {
      if (id === noteRequest.current) {
        setNotesError(
          cause instanceof Error ? cause.message : 'Diğer notlar alınamadı.',
        );
      }
    } finally {
      if (id === noteRequest.current) setNotesLoadingMore(false);
    }
  }, [canViewNotes, noteFilters, notePage, notesLoadingMore, personId]);
  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    setActivityError('');
    try {
      setActivities((await getPlayerActivityPage(personId)).items);
    } catch (cause) {
      setActivityError(
        cause instanceof Error ? cause.message : 'Aktivite alınamadı.',
      );
    } finally {
      setActivityLoading(false);
    }
  }, [personId]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotes(), 250);
    return () => window.clearTimeout(timer);
  }, [loadNotes]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadActivity(), 0);
    return () => window.clearTimeout(timer);
  }, [loadActivity]);
  useEffect(() => {
    if (player) document.title = `${player.displayName} | NGCS`;
  }, [player]);
  useEffect(() => {
    if (!canViewNotes && tab === 'notes') updateQuery({ tab: 'overview' });
  }, [canViewNotes, tab, updateQuery]);

  if (state.loading)
    return (
      <div className="page-shell player-profile-reference">
        <Skeleton className="h-40" />
        <div className="loading-grid">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      </div>
    );
  if (!player)
    return (
      <div className="page-shell">
        <Alert className="route-error">
          <AlertTitle>Oyuncu profili açılamadı</AlertTitle>
          <AlertDescription>
            {state.error || 'Oyuncu bulunamadı.'}
          </AlertDescription>
          <Button variant="outline" onClick={state.retry}>
            Tekrar dene
          </Button>
        </Alert>
      </div>
    );

  const active = player.assignments.find(
    (item) => !item.validTo || new Date(item.validTo) > new Date(),
  );
  const teams = Array.from(
    new Map(
      player.assignments
        .flatMap((item) => (item.team ? [item.team] : []))
        .map((team) => [team.id, team]),
    ).values(),
  );
  const activeTeams = Array.from(
    new Map(
      player.assignments
        .filter(
          (item) =>
            new Date(item.validFrom) <= new Date() &&
            (!item.validTo || new Date(item.validTo) > new Date()),
        )
        .flatMap((item) => (item.team ? [item.team] : []))
        .map((team) => [team.id, team]),
    ).values(),
  );
  const availability = player.availabilityPeriods?.[0];

  return (
    <div className="page-shell player-profile-reference">
      <section className="player-profile-header" aria-labelledby="player-name">
        <div className="player-profile-identity">
          <div className="player-profile-avatar" aria-hidden="true">
            {initials(player.displayName)}
          </div>
          <div>
            <p className="page-kicker">Oyuncu Profili</p>
            <h1 id="player-name">{player.displayName}</h1>
            <p>
              {positionLabel(player.playerProfile.primaryPosition)} ·{' '}
              {footLabel(player.playerProfile.preferredFoot)} ayak ·{' '}
              {active?.team?.name ?? 'Aktif takım ataması yok'}
            </p>
          </div>
        </div>
        <div className="player-profile-actions">
          {notePage?.permissions.canCreate ? (
            <Button onClick={() => setEditor('new')}>
              <NotePencil /> Not ekle
            </Button>
          ) : null}
          {role !== 'PLAYER' ? (
            <AssignmentDialog
              personId={player.id}
              clubId={player.clubId}
              onSaved={state.reload}
            />
          ) : null}
          <Button variant="outline" asChild>
            <Link to="/app/players">
              <ArrowLeft /> Oyunculara dön
            </Link>
          </Button>
        </div>
      </section>

      <Tabs
        value={tab}
        onValueChange={(value) => updateQuery({ tab: value })}
        className="player-profile-tabs"
      >
        <TabsList aria-label="Oyuncu profili bölümleri">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          {canViewNotes ? (
            <TabsTrigger value="notes">Notlar</TabsTrigger>
          ) : null}
          <TabsTrigger value="activity">Aktivite</TabsTrigger>
          <TabsTrigger value="journey">Yolculuk</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="player-profile-overview">
            <Card>
              <CardHeader>
                <CardTitle>Futbol profili</CardTitle>
                <CardDescription>
                  Güncel sportif kimlik ve atama.
                </CardDescription>
              </CardHeader>
              <CardContent className="player-profile-facts">
                <Fact
                  label="Takım"
                  value={active?.team?.name ?? 'Aktif atama yok'}
                />
                <Fact
                  label="Rol"
                  value={active?.roleDefinition.name ?? 'Oyuncu'}
                />
                <Fact
                  label="Ana pozisyon"
                  value={positionLabel(player.playerProfile.primaryPosition)}
                />
                <Fact
                  label="Tercih edilen ayak"
                  value={footLabel(player.playerProfile.preferredFoot)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sportif uygunluk</CardTitle>
                <CardDescription>Kaydedilmiş güncel durum.</CardDescription>
              </CardHeader>
              <CardContent>
                {availability ? (
                  <div className="availability-state">
                    <ShieldCheck />
                    <span>
                      <strong>{availabilityLabel(availability.status)}</strong>
                      <small>
                        {availability.restrictionSummary ||
                          `Başlangıç: ${formatDate(availability.validFrom)}`}
                      </small>
                    </span>
                  </div>
                ) : (
                  <EmptyState
                    title="Güncel uygunluk kaydı bulunmuyor"
                    detail="Yeni kayıt oluştuğunda burada gösterilecek."
                  />
                )}
              </CardContent>
            </Card>
            {canViewNotes ? (
              <Card>
                <CardHeader className="player-card-heading">
                  <div>
                    <CardTitle>Açık takipler</CardTitle>
                    <CardDescription>Takip gerektiren notlar.</CardDescription>
                  </div>
                  <span className="player-profile-count">
                    {notePage?.summary.openFollowUps ?? 0}
                  </span>
                </CardHeader>
                <CardContent>
                  {notePage?.summary.openFollowUps ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateQuery({ tab: 'notes', followUpStatus: 'OPEN' })
                      }
                    >
                      Açık takipleri görüntüle
                    </Button>
                  ) : (
                    <EmptyState
                      title="Açık takip bulunmuyor"
                      detail="Takip tarihli notlar burada özetlenecek."
                    />
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
          <div className="player-profile-lists">
            {canViewNotes ? (
              <Card>
                <CardHeader className="player-card-heading">
                  <div>
                    <CardTitle>Son notlar</CardTitle>
                    <CardDescription>En güncel üç ekip notu.</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => updateQuery({ tab: 'notes' })}
                  >
                    Tümünü gör
                  </Button>
                </CardHeader>
                <CardContent>
                  <NoteList
                    notes={notePage?.items.slice(0, 3) ?? []}
                    loading={notesLoading}
                    error={notesError}
                    onRetry={loadNotes}
                    onEdit={setEditor}
                    onChanged={loadNotes}
                    personId={personId}
                    teams={activeTeams}
                  />
                </CardContent>
              </Card>
            ) : null}
            <Card>
              <CardHeader className="player-card-heading">
                <div>
                  <CardTitle>Son aktiviteler</CardTitle>
                  <CardDescription>
                    Tarihli ve kaynaklı sportif kayıtlar.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => updateQuery({ tab: 'activity' })}
                >
                  Tümünü gör
                </Button>
              </CardHeader>
              <CardContent>
                <ActivityList
                  items={activities.slice(0, 4)}
                  loading={activityLoading}
                  error={activityError}
                  onRetry={loadActivity}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {canViewNotes ? (
          <TabsContent value="notes">
            <Card>
              <CardHeader className="player-notes-header">
                <div>
                  <CardTitle>Oyuncu notları</CardTitle>
                  <CardDescription>
                    Teknik gözlem ve takip kayıtları. Klinik veya psikolojik
                    veri girmeyin.
                  </CardDescription>
                </div>
                {notePage?.permissions.canCreate ? (
                  <Button onClick={() => setEditor('new')}>
                    <Plus /> Yeni not
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                <NoteFilters
                  params={params}
                  teams={teams}
                  updateQuery={updateQuery}
                />
                <NoteList
                  notes={notePage?.items ?? []}
                  loading={notesLoading}
                  error={notesError}
                  onRetry={loadNotes}
                  onEdit={setEditor}
                  onChanged={loadNotes}
                  personId={personId}
                  teams={activeTeams}
                  filtered={
                    Boolean(
                      noteFilters.q ||
                        noteFilters.category ||
                        noteFilters.followUpStatus ||
                        noteFilters.teamId,
                    ) || noteFilters.status === 'ARCHIVED'
                  }
                />
                {notePage?.nextCursor && !notesLoading && !notesError ? (
                  <div className="player-note-pagination">
                    <Button
                      variant="outline"
                      disabled={notesLoadingMore}
                      onClick={() => void loadMoreNotes()}
                    >
                      {notesLoadingMore ? 'Yükleniyor…' : 'Daha fazla not'}
                    </Button>
                    <span>
                      {notePage.items.length} / {notePage.total} not
                      gösteriliyor
                    </span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Sportif aktivite</CardTitle>
              <CardDescription>
                Takım atamaları ve kaydedilmiş antrenman katılımları.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityList
                items={activities}
                loading={activityLoading}
                error={activityError}
                onRetry={loadActivity}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey">
          <Card>
            <CardHeader className="player-journey-header">
              <div>
                <CardTitle>Takım ve rol yolculuğu</CardTitle>
                <CardDescription>
                  {player.assignmentPage.historyVisible
                    ? 'Seçilen tarihe kadar yetkili atama geçmişi.'
                    : 'Yalnız seçilen tarihte aktif olan atamalar.'}
                </CardDescription>
              </div>
              <label className="as-of-control">
                <span>Yolculuk tarihi</span>
                <input
                  aria-label="Yolculuk tarihi"
                  type="date"
                  value={asOf}
                  onChange={(event) =>
                    updateQuery({ asOf: event.target.value })
                  }
                />
              </label>
            </CardHeader>
            <CardContent>
              {player.assignments.length ? (
                <ol className="pathway-timeline">
                  {player.assignments.map((assignment) => (
                    <li key={assignment.id}>
                      <span className="timeline-dot">
                        <ClockCounterClockwise />
                      </span>
                      <div>
                        <div className="timeline-heading">
                          <strong>
                            {assignment.team?.name ??
                              assignment.roleDefinition.name}
                          </strong>
                          <Badge variant="outline">
                            {assignmentLabel(assignment.assignmentType)}
                          </Badge>
                        </div>
                        <p>
                          {dateRange(assignment.validFrom, assignment.validTo)}
                        </p>
                        <small>
                          {assignment.reason || 'Sportif atama'} ·{' '}
                          {sourceLabel(assignment.source)}
                        </small>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  title={
                    player.assignmentPage.total
                      ? 'Bu sayfada atama bulunmuyor'
                      : 'Atama geçmişi bulunmuyor'
                  }
                  detail="Farklı tarih seçebilir veya önceki sayfaya dönebilirsiniz."
                />
              )}
              <AssignmentPageControls
                label="Atama geçmişi sayfaları"
                page={player.assignmentPage}
                count={player.assignments.length}
                state={state}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NoteEditorSheet
        open={editor !== null}
        note={editor === 'new' ? null : editor}
        personId={personId}
        teams={activeTeams}
        defaultTeamId={active?.team?.id ?? activeTeams[0]?.id ?? ''}
        onOpenChange={(open) => !open && setEditor(null)}
        onSaved={async () => {
          setEditor(null);
          await loadNotes();
        }}
      />
    </div>
  );
}

function NoteFilters({
  params,
  teams,
  updateQuery,
}: {
  params: URLSearchParams;
  teams: Array<{ id: string; name: string }>;
  updateQuery: (changes: Record<string, string | null>) => void;
}) {
  return (
    <div className="player-note-filters" aria-label="Not filtreleri">
      <Input
        aria-label="Notlarda ara"
        placeholder="Notlarda ara…"
        value={params.get('q') ?? ''}
        onChange={(event) => updateQuery({ q: event.target.value })}
      />
      <NativeSelect
        aria-label="Not kategorisi"
        value={params.get('category') ?? ''}
        onChange={(event) =>
          updateQuery({ category: event.target.value || null })
        }
      >
        <option value="">Tüm kategoriler</option>
        {noteCategories.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Takip durumu"
        value={params.get('followUpStatus') ?? ''}
        onChange={(event) =>
          updateQuery({ followUpStatus: event.target.value || null })
        }
      >
        <option value="">Tüm takip durumları</option>
        <option value="OPEN">Açık</option>
        <option value="DONE">Tamamlandı</option>
        <option value="CANCELLED">İptal</option>
      </NativeSelect>
      <NativeSelect
        aria-label="Kaynak takım"
        value={params.get('teamId') ?? ''}
        onChange={(event) =>
          updateQuery({ teamId: event.target.value || null })
        }
      >
        <option value="">Tüm takımlar</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Not görünümü"
        value={params.get('status') ?? 'ACTIVE'}
        onChange={(event) =>
          updateQuery({
            status: event.target.value === 'ARCHIVED' ? 'ARCHIVED' : null,
          })
        }
      >
        <option value="ACTIVE">Aktif notlar</option>
        <option value="ARCHIVED">Arşivlenen notlar</option>
      </NativeSelect>
      <Button
        variant="ghost"
        onClick={() =>
          updateQuery({
            q: null,
            category: null,
            followUpStatus: null,
            teamId: null,
            status: null,
          })
        }
      >
        Filtreleri temizle
      </Button>
    </div>
  );
}

function NoteList({
  notes,
  loading,
  error,
  onRetry,
  onEdit,
  onChanged,
  personId,
  teams,
  filtered = false,
}: {
  notes: PlayerNote[];
  loading: boolean;
  error: string;
  onRetry: () => Promise<void>;
  onEdit: (note: PlayerNote) => void;
  onChanged: () => Promise<void>;
  personId: string;
  teams: Array<{ id: string; name: string }>;
  filtered?: boolean;
}) {
  if (loading) return <Skeleton className="h-28" />;
  if (error)
    return (
      <Alert>
        <AlertTitle>Notlar alınamadı</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" onClick={() => void onRetry()}>
          Tekrar dene
        </Button>
      </Alert>
    );
  if (!notes.length)
    return (
      <EmptyState
        title={
          filtered ? 'Filtrelerle eşleşen not yok' : 'Henüz oyuncu notu yok'
        }
        detail={
          filtered
            ? 'Filtreleri temizleyerek tüm notları görebilirsiniz.'
            : 'İlk teknik ekip notu eklendiğinde burada gösterilecek.'
        }
      />
    );
  return (
    <div className="player-note-list">
      {notes.map((note) => (
        <article key={note.id} className="player-note-card">
          <div className="player-note-card__meta">
            <Badge variant="outline">{categoryLabel(note.category)}</Badge>
            {note.archivedAt ? (
              <Badge variant="secondary">Arşivde</Badge>
            ) : null}
            {note.followUpStatus ? (
              <Badge
                variant={
                  note.followUpStatus === 'OPEN' ? 'default' : 'secondary'
                }
              >
                {followUpLabel(note.followUpStatus)}
              </Badge>
            ) : null}
            <time dateTime={note.observedAt}>
              {formatDate(note.observedAt)}
            </time>
            <NoteActions
              note={note}
              personId={personId}
              teams={teams}
              onEdit={() => onEdit(note)}
              onChanged={onChanged}
            />
          </div>
          <p>{note.body}</p>
          <footer>
            <span>{note.author.name}</span>
            <span>{note.originTeam.name}</span>
            <span>
              {note.teamGrants.length
                ? `Paylaşılan: ${note.teamGrants.map((team) => team.name).join(', ')}`
                : 'Yalnız kaynak takım'}
            </span>
            <span>Güncellendi {formatDateTime(note.updatedAt)}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}

function NoteActions({
  note,
  personId,
  teams,
  onEdit,
  onChanged,
}: {
  note: PlayerNote;
  personId: string;
  teams: Array<{ id: string; name: string }>;
  onEdit: () => void;
  onChanged: () => Promise<void>;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revisions, setRevisions] = useState<
    Array<{
      id: string;
      version: number;
      createdAt: string;
      editedBy: { name: string };
    }>
  >([]);
  const archived = Boolean(note.archivedAt);
  async function changeArchiveState() {
    setBusy(true);
    try {
      if (archived) {
        await restorePlayerNote(personId, note.id, note.version);
        toast.success('Not geri yüklendi');
      } else {
        await archivePlayerNote(personId, note.id, note.version);
        toast.success('Not arşivlendi');
      }
      setConfirmOpen(false);
      await onChanged();
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : archived
            ? 'Not geri yüklenemedi.'
            : 'Not arşivlenemedi.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function history() {
    setHistoryOpen(true);
    try {
      setRevisions((await getPlayerNoteRevisions(personId, note.id)).items);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Geçmiş alınamadı.');
    }
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Not işlemleri">
            <DotsThree />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {note.permissions.canEdit && !archived ? (
            <DropdownMenuItem onSelect={onEdit}>
              <PencilSimple /> Düzenle
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => void history()}>
            <ClockCounterClockwise /> Sürüm geçmişi
          </DropdownMenuItem>
          {note.permissions.canShare && !archived ? (
            <DropdownMenuItem onSelect={() => setShareOpen(true)}>
              <ShareNetwork /> Takımla paylaş
            </DropdownMenuItem>
          ) : null}
          {note.permissions.canArchive ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setConfirmOpen(true)}>
                {archived ? <ClockCounterClockwise /> : <Trash />}
                {archived ? 'Geri yükle' : 'Arşivle'}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {archived ? 'Not geri yüklensin mi?' : 'Not arşivlensin mi?'}
            </DialogTitle>
            <DialogDescription>
              {archived
                ? 'Not yeniden aktif listeye alınır; sürüm geçmişi korunur.'
                : 'Not aktif listeden kaldırılır; sürüm geçmişi korunur.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void changeArchiveState()}
            >
              {busy
                ? archived
                  ? 'Geri yükleniyor…'
                  : 'Arşivleniyor…'
                : archived
                  ? 'Notu geri yükle'
                  : 'Notu arşivle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ShareNoteDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        note={note}
        personId={personId}
        teams={teams}
        onSaved={onChanged}
      />
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-h-[80dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sürüm geçmişi</DialogTitle>
            <DialogDescription>
              Değişiklik kayıtları salt okunur korunur.
            </DialogDescription>
          </DialogHeader>
          <ol className="player-note-revisions">
            {revisions.map((revision) => (
              <li key={revision.id}>
                <strong>Sürüm {revision.version}</strong>
                <span>{revision.editedBy.name}</span>
                <time>{formatDateTime(revision.createdAt)}</time>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ShareNoteDialog({
  open,
  onOpenChange,
  note,
  personId,
  teams,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  note: PlayerNote;
  personId: string;
  teams: Array<{ id: string; name: string }>;
  onSaved: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>(() =>
    note.teamGrants.map((team) => team.id),
  );
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      await replacePlayerNoteShares(personId, note.id, note.version, selected);
      toast.success('Not paylaşımı güncellendi');
      onOpenChange(false);
      await onSaved();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Paylaşım güncellenemedi.',
      );
    } finally {
      setBusy(false);
    }
  }
  const targets = teams.filter((team) => team.id !== note.originTeamId);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value) setSelected(note.teamGrants.map((team) => team.id));
        onOpenChange(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Takımla paylaş</DialogTitle>
          <DialogDescription>
            Not yalnız oyuncunun aynı kulüpteki güncel takımına açılır.
          </DialogDescription>
        </DialogHeader>
        <div className="player-note-share-list">
          {targets.map((team) => (
            <label key={team.id}>
              <input
                type="checkbox"
                checked={selected.includes(team.id)}
                onChange={(event) =>
                  setSelected((previous) =>
                    event.target.checked
                      ? [...previous, team.id]
                      : previous.filter((id) => id !== team.id),
                  )
                }
              />
              <span>{team.name}</span>
            </label>
          ))}
          {!targets.length ? (
            <p className="sporting-muted">
              Paylaşılabilecek başka güncel takım yok.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button disabled={busy} onClick={() => void save()}>
            {busy ? 'Kaydediliyor…' : 'Paylaşımı kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NoteEditorSheet({
  open,
  note,
  personId,
  teams,
  defaultTeamId,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  note: PlayerNote | null;
  personId: string;
  teams: Array<{ id: string; name: string }>;
  defaultTeamId: string;
  onOpenChange: (value: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const followUpAt = String(data.get('followUpAt') ?? '');
    const input = {
      category: String(data.get('category')) as PlayerNoteCategory,
      body: String(data.get('body') ?? ''),
      observedAt: `${String(data.get('observedAt'))}T12:00:00.000Z`,
      followUpAt: followUpAt ? `${followUpAt}T12:00:00.000Z` : null,
      followUpStatus: followUpAt
        ? (String(data.get('followUpStatus')) as PlayerNoteFollowUpStatus)
        : null,
    };
    setBusy(true);
    try {
      if (note)
        await updatePlayerNote(personId, note.id, {
          ...input,
          expectedVersion: note.version,
        });
      else
        await createPlayerNote(personId, {
          ...input,
          originTeamId: String(data.get('originTeamId')),
        });
      toast.success(note ? 'Not güncellendi' : 'Not eklendi');
      await onSaved();
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Not kaydedilemedi.';
      toast.error(
        message.includes('PLAYER_NOTE_VERSION_CONFLICT')
          ? 'Not başka bir kullanıcı tarafından güncellendi. Liste yenilendi.'
          : message,
      );
      if (message.includes('PLAYER_NOTE_VERSION_CONFLICT')) await onSaved();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="player-note-sheet">
        <SheetHeader>
          <SheetTitle>{note ? 'Notu düzenle' : 'Oyuncuya not ekle'}</SheetTitle>
          <SheetDescription>
            Sportif gözlemi tarih ve kaynak takımla kaydedin. Klinik, teşhis
            veya psikolojik değerlendirme girmeyin.
          </SheetDescription>
        </SheetHeader>
        <form
          key={note?.id ?? 'new'}
          className="player-note-form"
          onSubmit={submit}
        >
          <FormField label="Kategori" htmlFor="note-category">
            <NativeSelect
              id="note-category"
              name="category"
              defaultValue={note?.category ?? 'GENERAL'}
            >
              {noteCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabel(category)}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Gözlem tarihi" htmlFor="note-observed-at">
            <Input
              id="note-observed-at"
              name="observedAt"
              type="date"
              required
              defaultValue={dateInput(note?.observedAt)}
            />
          </FormField>
          <FormField label="Kaynak takım" htmlFor="note-origin-team">
            <NativeSelect
              id="note-origin-team"
              name="originTeamId"
              required
              disabled={Boolean(note)}
              defaultValue={note?.originTeamId ?? defaultTeamId}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Not" htmlFor="note-body">
            <Textarea
              id="note-body"
              name="body"
              required
              minLength={1}
              maxLength={4000}
              rows={9}
              defaultValue={note?.body ?? ''}
              placeholder="Gözlemi ve gerekli sonraki adımı yazın…"
            />
          </FormField>
          <div className="player-note-follow-up">
            <FormField
              label="Takip tarihi (isteğe bağlı)"
              htmlFor="note-follow-up-at"
            >
              <Input
                id="note-follow-up-at"
                name="followUpAt"
                type="date"
                defaultValue={
                  note?.followUpAt ? dateInput(note.followUpAt) : ''
                }
              />
            </FormField>
            <FormField label="Takip durumu" htmlFor="note-follow-up-status">
              <NativeSelect
                id="note-follow-up-status"
                name="followUpStatus"
                defaultValue={note?.followUpStatus ?? 'OPEN'}
              >
                <option value="OPEN">Açık</option>
                <option value="DONE">Tamamlandı</option>
                <option value="CANCELLED">İptal</option>
              </NativeSelect>
            </FormField>
          </div>
          <div className="player-note-form__actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={busy || (!note && !defaultTeamId)}>
              {busy
                ? 'Kaydediliyor…'
                : note
                  ? 'Değişiklikleri kaydet'
                  : 'Notu ekle'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function ActivityList({
  items,
  loading,
  error,
  onRetry,
}: {
  items: PlayerActivityItem[];
  loading: boolean;
  error: string;
  onRetry: () => Promise<void>;
}) {
  if (loading) return <Skeleton className="h-32" />;
  if (error)
    return (
      <Alert>
        <AlertTitle>Aktivite alınamadı</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" onClick={() => void onRetry()}>
          Tekrar dene
        </Button>
      </Alert>
    );
  if (!items.length)
    return (
      <div className="player-activity-empty">
        <EmptyState
          title="Henüz katılım veya atama aktivitesi bulunmuyor"
          detail="Antrenman katılımı veya takım ataması oluştuğunda burada görünür."
        />
        <div>
          <Button variant="outline" asChild>
            <Link to="/app/attendance">Yoklamaya git</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app/trainings">Antrenmanlara git</Link>
          </Button>
        </div>
      </div>
    );
  return (
    <ol className="player-activity-list">
      {items.map((item) => {
        const content = (
          <>
            <span className="player-activity-icon">
              {item.kind === 'TRAINING_ATTENDANCE' ? (
                <CheckCircle />
              ) : (
                <UsersThree />
              )}
            </span>
            <span>
              <strong>{item.title}</strong>
              <small>
                {activityStatusLabel(item.status)} ·{' '}
                {item.team?.name ?? item.detail}
              </small>
            </span>
            <time dateTime={item.occurredAt}>
              {formatDate(item.occurredAt)}
            </time>
          </>
        );
        return (
          <li key={item.id}>
            {item.link ? <Link to={item.link}>{content}</Link> : content}
          </li>
        );
      })}
    </ol>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="player-profile-empty">
      <WarningCircle />
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}

function AssignmentDialog({
  personId,
  clubId,
  onSaved,
}: {
  personId: string;
  clubId: string;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [roleId, setRoleId] = useState('');
  function setDialogOpen(nextOpen: boolean) {
    if (saving) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setTeamId('');
      setRoleId('');
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamId || !roleId) return;
    const data = new FormData(event.currentTarget);
    const assignmentType = String(
      data.get('assignmentType'),
    ) as SportingAssignmentType;
    const input = {
      personId,
      teamId,
      roleDefinitionId: roleId,
      validFrom: `${String(data.get('validAt'))}T12:00:00.000Z`,
      reason: String(data.get('reason') ?? '').trim() || undefined,
    };
    setSaving(true);
    try {
      if (assignmentType === 'PRIMARY_REGISTERED')
        await transitionSportingPrimary({
          personId,
          teamId,
          roleDefinitionId: roleId,
          validAt: input.validFrom,
          reason: input.reason,
        });
      else await createSportingAssignment({ ...input, assignmentType });
      toast.success('Sportif atama kaydedildi');
      setOpen(false);
      setTeamId('');
      setRoleId('');
      await onSaved();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : 'Atama kaydedilemedi.',
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus /> Atama ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sportif atama</DialogTitle>
          <DialogDescription>
            Geçici görev ekleyin veya ana takım geçişini kaydedin.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1"
          onSubmit={submit}
          aria-busy={saving}
        >
          <AssignmentCatalogSelect
            kind="teams"
            clubId={clubId}
            name="teamId"
            label="Atama takımı"
            onSelect={setTeamId}
          />
          <FormField label="Atama türü" htmlFor="assignment-type">
            <NativeSelect
              id="assignment-type"
              name="assignmentType"
              required
              defaultValue="TRAINING_GUEST"
            >
              <option value="TRAINING_GUEST">Antrenman misafiri</option>
              <option value="MATCH_ELIGIBLE">Maç uygunluğu</option>
              <option value="PRIMARY_REGISTERED">Ana takım geçişi</option>
              <option value="LOAN_IN">Kiralık gelen</option>
              <option value="INTERNATIONAL_DUTY">Milli takım</option>
            </NativeSelect>
          </FormField>
          <AssignmentCatalogSelect
            kind="roles"
            clubId={clubId}
            name="roleDefinitionId"
            label="Atama rolü"
            onSelect={setRoleId}
          />
          <FormField label="Başlangıç" htmlFor="assignment-start">
            <Input
              id="assignment-start"
              name="validAt"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </FormField>
          <div className="col-span-full">
            <FormField label="Gerekçe" htmlFor="assignment-reason">
              <Input
                id="assignment-reason"
                name="reason"
                placeholder="Sportif gerekçe"
              />
            </FormField>
          </div>
          <DialogFooter className="col-span-full flex-wrap">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Vazgeç
            </Button>
            <Button type="submit" disabled={saving || !teamId || !roleId}>
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
const noteCategories: PlayerNoteCategory[] = [
  'GENERAL',
  'TRAINING',
  'MATCH',
  'TECHNICAL',
  'TACTICAL',
  'DEVELOPMENT',
];
const categoryLabel = (value: PlayerNoteCategory) =>
  (
    ({
      GENERAL: 'Genel',
      TRAINING: 'Antrenman',
      MATCH: 'Maç',
      TECHNICAL: 'Teknik',
      TACTICAL: 'Taktik',
      DEVELOPMENT: 'Gelişim',
    }) as const
  )[value];
const followUpLabel = (value: PlayerNoteFollowUpStatus) =>
  (({ OPEN: 'Açık takip', DONE: 'Tamamlandı', CANCELLED: 'İptal' }) as const)[
    value
  ];
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('tr-TR');
const positionLabel = (
  value: SportingPlayer360['playerProfile']['primaryPosition'],
) =>
  (
    ({
      KALECI: 'Kaleci',
      DEFANS: 'Defans',
      ORTA_SAHA: 'Orta saha',
      FORVET: 'Forvet',
    }) as Record<string, string>
  )[value ?? ''] ?? 'Pozisyon belirtilmemiş';
const footLabel = (
  value: SportingPlayer360['playerProfile']['preferredFoot'],
) =>
  (
    ({
      LEFT: 'Sol',
      RIGHT: 'Sağ',
      BOTH: 'İki',
      UNKNOWN: 'Belirtilmemiş',
    }) as Record<string, string>
  )[value ?? 'UNKNOWN'];
const availabilityLabel = (value: string) =>
  (
    ({
      AVAILABLE: 'Uygun',
      MODIFIED: 'Uyarlanmış program',
      UNAVAILABLE: 'Uygun değil',
      RETURNING: 'Dönüş sürecinde',
      SUSPENDED: 'Cezalı',
      INTERNATIONAL_DUTY: 'Milli takımda',
      OTHER: 'Diğer',
    }) as Record<string, string>
  )[value] ?? 'Durum belirtilmemiş';
const assignmentLabel = (value: string) =>
  (
    ({
      LEGACY_MEMBER: 'Mevcut kadro',
      PRIMARY_REGISTERED: 'Ana kadro',
      TRAINING_GUEST: 'Antrenman misafiri',
      MATCH_ELIGIBLE: 'Maç kadrosu',
      LOAN_IN: 'Kiralık gelen',
      LOAN_OUT: 'Kiralık giden',
      INTERNATIONAL_DUTY: 'Milli takım',
      STAFF: 'Teknik ekip',
    }) as Record<string, string>
  )[value] ?? 'Sportif atama';
const activityStatusLabel = (value: string) =>
  (
    ({
      PRESENT: 'Katıldı',
      ABSENT: 'Katılmadı',
      LEGACY_MEMBER: 'Kadroya eklendi',
      PRIMARY_REGISTERED: 'Ana kadro',
      TRAINING_GUEST: 'Antrenman misafiri',
      MATCH_ELIGIBLE: 'Maç kadrosu',
      LOAN_IN: 'Kiralık geldi',
      LOAN_OUT: 'Kiralık gitti',
      INTERNATIONAL_DUTY: 'Milli takım görevi',
      STAFF: 'Teknik ekip',
    }) as Record<string, string>
  )[value] ?? 'Sportif kayıt';
const sourceLabel = (value: string | null) =>
  value?.startsWith('PLAYER_GROUP_') || value === 'TEST'
    ? 'Yerel kadro aktarımı'
    : value
      ? 'NGCS sportif operasyon kaydı'
      : 'Manuel sportif kayıt';
const formatter = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const formatDate = (value: string) => formatter.format(new Date(value));
const formatDateTime = (value: string) =>
  dateTimeFormatter.format(new Date(value));
const dateInput = (value?: string) =>
  (value ? new Date(value) : new Date()).toISOString().slice(0, 10);
const dateRange = (from: string, to: string | null) =>
  `${formatDate(from)} — ${to ? formatDate(to) : 'devam ediyor'}`;
