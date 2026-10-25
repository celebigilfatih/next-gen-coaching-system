import { useWorkspace } from '../lib/workspace-context';
import { CatalogControls } from './catalog-controls';

export function WorkspaceScopeSelector({
  variant = 'panel',
}: {
  variant?: 'panel' | 'topbar';
}) {
  const {
    clubs,
    clubSeasons,
    teams,
    scope,
    loading,
    selectScope,
    catalogError,
    catalogLoading,
  } = useWorkspace();
  return (
    <section
      className={`workspace-scope-panel workspace-scope-panel--${variant}`}
      aria-label="Çalışma kapsamı"
    >
      <div>
        <label>
          <span>Kulüp</span>
          <select
            aria-label="Aktif kulüp"
            value={scope.clubId}
            disabled={loading || catalogLoading !== null || clubs.length < 2}
            onChange={(event) =>
              selectScope({
                clubId: event.target.value,
                clubSeasonId: '',
                teamId: '',
              })
            }
          >
            {!clubs.length && <option value="">Kulüp bulunamadı</option>}
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <CatalogControls kind="clubs" label="Kulüp" />
      </div>
      <div>
        <label>
          <span>Sezon</span>
          <select
            aria-label="Aktif sezon"
            value={scope.clubSeasonId}
            disabled={loading || catalogLoading !== null || !clubSeasons.length}
            onChange={(event) =>
              selectScope({ clubSeasonId: event.target.value })
            }
          >
            {!clubSeasons.length && <option value="">Sezon bulunamadı</option>}
            <option value="*">Tüm sezonlar</option>
            {clubSeasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
        </label>
        <CatalogControls kind="seasons" label="Sezon" />
      </div>
      <div>
        <label>
          <span>Takım</span>
          <select
            aria-label="Aktif takım"
            value={scope.teamId}
            disabled={loading || catalogLoading !== null || !teams.length}
            onChange={(event) => selectScope({ teamId: event.target.value })}
          >
            {!teams.length && <option value="">Takım bulunamadı</option>}
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <CatalogControls kind="teams" label="Takım" />
      </div>
      {catalogError && (
        <p role="alert" className="col-span-full">
          {catalogError} Sayfa düğmesiyle yeniden deneyebilirsiniz.
        </p>
      )}
    </section>
  );
}
