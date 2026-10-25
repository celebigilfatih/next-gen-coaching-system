import { useEffect, useMemo, useState } from 'react';
import type { DrillCatalogFilters, DrillPhase } from '../lib/api';
import { Input } from './ui/input';
import { NativeSelect } from './ui/native-select';
import { Button } from './ui/button';

export const drillPhases: { value: DrillPhase; label: string }[] = [
  { value: 'WARM_UP', label: 'Isınma' },
  { value: 'TECHNICAL', label: 'Teknik' },
  { value: 'TACTICAL', label: 'Taktik' },
  { value: 'COOL_DOWN', label: 'Soğuma' },
];
export const phaseLabel = (phase: DrillPhase) =>
  drillPhases.find((item) => item.value === phase)?.label ?? phase;
export const supportedDrillAges = ['U12', 'U14', 'U16', 'U18', 'SENIOR'];

export function useDrillCatalogFilters() {
  const [draft, setDraft] = useState<DrillCatalogFilters>({});
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(
      () => setSearch(draft.q?.trim() ?? ''),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [draft.q]);
  const filters = useMemo(
    () => ({
      ageGroup: draft.ageGroup,
      objective: draft.objective,
      difficulty: draft.difficulty,
      minDuration: draft.minDuration,
      maxDuration: draft.maxDuration,
      minPlayers: draft.minPlayers,
      maxPlayers: draft.maxPlayers,
      source: draft.source,
      scope: draft.scope,
      q: search || undefined,
      equipment: draft.equipment?.trim() || undefined,
    }),
    [
      draft.ageGroup,
      draft.objective,
      draft.difficulty,
      draft.minDuration,
      draft.maxDuration,
      draft.minPlayers,
      draft.maxPlayers,
      draft.source,
      draft.scope,
      draft.equipment,
      search,
    ],
  );
  return { draft, setDraft, filters };
}

const objectives = [
  ['pas', 'Pas'],
  ['ilk-kontrol', 'İlk kontrol'],
  ['bitiricilik', 'Bitiricilik'],
  ['topa-sahip-olma', 'Topa sahip olma'],
  ['geriden-oyun', 'Geriden oyun'],
  ['pres', 'Pres'],
  ['hucum-gecisi', 'Hücum geçişi'],
  ['savunma-gecisi', 'Savunma geçişi'],
];

export function DrillCatalogFilterFields({
  value,
  onChange,
  disabled = false,
  allowAge = true,
  showSearch = true,
  defaultAgeLabel = 'Takım yaşı',
}: {
  value: DrillCatalogFilters;
  onChange: (value: DrillCatalogFilters) => void;
  disabled?: boolean;
  allowAge?: boolean;
  showSearch?: boolean;
  defaultAgeLabel?: string;
}) {
  const change = (key: keyof DrillCatalogFilters, input: string) =>
    onChange({
      ...value,
      [key]: input
        ? key.startsWith('min') || key.startsWith('max')
          ? Number(input)
          : input
        : undefined,
    });
  return (
    <fieldset disabled={disabled} className="drill-filter-fields">
      {showSearch && (
        <label>
          Egzersiz ara
          <Input
            aria-label="Egzersiz ara"
            maxLength={80}
            placeholder="Başlık, amaç veya etiket ara"
            value={value.q ?? ''}
            onChange={(e) => change('q', e.target.value)}
          />
        </label>
      )}
      {allowAge && (
        <label>
          Yaş grubu
          <NativeSelect
            aria-label="Yaş grubu"
            value={value.ageGroup ?? ''}
            onChange={(e) => change('ageGroup', e.target.value)}
          >
            <option value="">{defaultAgeLabel}</option>
            {supportedDrillAges.map((age) => (
              <option key={age} value={age}>
                {age === 'SENIOR' ? 'A Takım' : age}
              </option>
            ))}
          </NativeSelect>
        </label>
      )}
      <label>
        Amaç
        <NativeSelect
          aria-label="Egzersiz amacı"
          value={value.objective ?? ''}
          onChange={(e) => change('objective', e.target.value)}
        >
          <option value="">Tüm amaçlar</option>
          {objectives.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </label>
      <label>
        Zorluk
        <NativeSelect
          aria-label="Zorluk"
          value={value.difficulty ?? ''}
          onChange={(e) => change('difficulty', e.target.value)}
        >
          <option value="">Tüm zorluklar</option>
          <option value="EASY">Başlangıç</option>
          <option value="MEDIUM">Orta</option>
          <option value="HARD">İleri</option>
        </NativeSelect>
      </label>
      {(
        ['minDuration', 'maxDuration', 'minPlayers', 'maxPlayers'] as const
      ).map((key, index) => (
        <label key={key}>
          {
            [
              'En az süre (dk)',
              'En çok süre (dk)',
              'En az oyuncu',
              'En çok oyuncu',
            ][index]
          }
          <Input
            type="number"
            min={1}
            max={key.includes('Duration') ? 300 : 60}
            aria-label={
              [
                'En az süre (dk)',
                'En çok süre (dk)',
                'En az oyuncu',
                'En çok oyuncu',
              ][index]
            }
            value={value[key] ?? ''}
            onChange={(e) => {
              if (
                !e.target.value ||
                (/^[1-9]\d{0,2}$/.test(e.target.value) &&
                  Number(e.target.value) <=
                    (key.includes('Duration') ? 300 : 60))
              )
                change(key, e.target.value);
            }}
          />
        </label>
      ))}
      <label>
        Ekipman
        <Input
          aria-label="Ekipman"
          maxLength={80}
          placeholder="Örn. koni"
          value={value.equipment ?? ''}
          onChange={(e) => change('equipment', e.target.value)}
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        disabled={
          !Object.values(value).some(
            (item) => item !== undefined && item !== '',
          )
        }
        onClick={() => onChange({})}
      >
        Filtreleri temizle
      </Button>
    </fieldset>
  );
}
