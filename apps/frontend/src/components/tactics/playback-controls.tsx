import { Pause, Play, SkipBack, Repeat, Stop } from '@phosphor-icons/react';
import { Button } from '../ui/button';
import type {
  PlaybackSpeed,
  TransportState,
} from '../../lib/tactical-transport';

export function playbackTime(value: number) {
  const tenths = Math.floor(value / 100);
  return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`;
}

export function PlaybackControls({
  state,
  durationMs,
  reducedMotion,
  disabled,
  sceneTitle,
  onPlay,
  onPause,
  onSeek,
  onSpeed,
  onLoop,
  onEdit,
}: {
  state: TransportState;
  durationMs: number;
  reducedMotion: boolean;
  disabled: boolean;
  sceneTitle?: string;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (ms: number) => void;
  onSpeed: (speed: PlaybackSpeed) => void;
  onLoop: (loop: boolean) => void;
  onEdit: () => void;
}) {
  return (
    <section className="board-playback" aria-label="Taktik oynatıcı">
      <div className="board-playback-actions">
        <Button
          size="sm"
          onClick={state.playing ? onPause : onPlay}
          disabled={disabled}
        >
          {state.playing ? <Pause /> : <Play />}
          {state.playing ? 'Duraklat' : 'Oynat'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSeek(0)}
          disabled={disabled}
        >
          <SkipBack />
          Başa dön
        </Button>
        <label>
          Hız{' '}
          <select
            aria-label="Oynatma hızı"
            value={state.speed}
            disabled={disabled}
            onChange={(event) =>
              onSpeed(Number(event.target.value) as PlaybackSpeed)
            }
          >
            <option value="0.5">0,5×</option>
            <option value="1">1×</option>
            <option value="2">2×</option>
          </select>
        </label>
        <Button
          size="sm"
          variant={state.loop ? 'secondary' : 'ghost'}
          aria-pressed={state.loop}
          disabled={disabled}
          onClick={() => onLoop(!state.loop)}
        >
          <Repeat aria-hidden="true" />
          Döngü
        </Button>
        {state.preview && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
            disabled={disabled}
          >
            <Stop aria-hidden="true" />
            Sabit sahneye dön
          </Button>
        )}
      </div>
      <div className="board-playback-time">
        <input
          type="range"
          aria-label="Oynatma zamanı"
          aria-valuetext={`${playbackTime(state.timeMs)} / ${playbackTime(durationMs)}`}
          min={0}
          max={durationMs}
          step={1}
          value={state.timeMs}
          disabled={disabled}
          onChange={(event) => onSeek(Number(event.target.value))}
        />
        <span>
          {playbackTime(state.timeMs)} / {playbackTime(durationMs)}
        </span>
      </div>
      <p>
        {state.preview
          ? `Önizleme · ${sceneTitle ?? ''}. Düzenlemek veya kaydetmek için sabit sahneye dönün.`
          : 'Önizleme kaydı değiştirmez. Oynatma kendiliğinden başlamaz.'}
        {reducedMotion &&
          ' Azaltılmış hareket tercihi etkin; hareket yalnız Oynat ile başlar, sahneleri tek tek de seçebilirsiniz.'}
      </p>
    </section>
  );
}
