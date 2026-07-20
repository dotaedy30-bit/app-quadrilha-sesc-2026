import type { Track } from '../data/playlist'
import { PauseIcon, PlayIcon, ResetIcon } from './Icons'

export type TrackState = { position: number; duration: number; completed: boolean; loading: boolean; error: boolean }
type Props = { track: Track; state: TrackState; playing: boolean; setAudioRef: (node: HTMLAudioElement | null) => void; onToggle: () => void; onReset: () => void; onLoaded: () => void; onTime: () => void; onEnded: () => void; onError: () => void }
const time = (seconds: number) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` : '0:00'

export function TrackCard({ track, state, playing, setAudioRef, onToggle, onReset, onLoaded, onTime, onEnded, onError }: Props) {
  const available = Boolean(track.audioPath)
  const progress = state.duration ? Math.min(100, (state.position / state.duration) * 100) : 0
  return <article id={`track-${track.id}`} className={`track-card ${playing ? 'active' : ''} ${state.completed ? 'completed' : ''} ${!available ? 'unavailable' : ''}`} style={{ '--accent': track.color, '--accent-2': track.colorSecondary } as React.CSSProperties}>
    {track.audioPath && <audio ref={setAudioRef} src={track.audioPath} preload="metadata" onLoadedMetadata={onLoaded} onTimeUpdate={onTime} onEnded={onEnded} onError={onError}/>} 
    <div className="track-heading"><span className="track-number">{track.number.toString().padStart(2, '0')}</span><div><p>FAIXA {track.number}</p><h2>{track.name}</h2>{track.description && <small>{track.description}</small>}</div>{state.completed && <span className="done-mark" aria-label="Concluída">✓</span>}</div>
    <div className="record-area">
      <button className={`vinyl ${playing ? 'spinning' : ''}`} disabled={!available || state.error} onClick={onToggle} aria-label={`${playing ? 'Pausar' : 'Tocar'} ${track.name}`}>
        <span className="vinyl-grooves"/><span className="vinyl-label"><span className="label-number">{track.number}</span><span className="play-center">{playing ? <PauseIcon/> : <PlayIcon/>}</span></span>
      </button>
      {playing && <div className="sound-waves" aria-hidden="true"><i/><i/><i/><i/></div>}
    </div>
    <div className="track-controls">
      <div className="status-line"><span>{state.error ? 'Não foi possível carregar' : !available ? 'Áudio ainda não adicionado' : state.loading ? 'Carregando áudio...' : playing ? 'Reproduzindo agora' : state.completed ? 'Faixa concluída' : state.position > 0 ? 'Pausada — posição preservada' : 'Pronta para tocar'}</span><button className="reset-button" onClick={onReset} disabled={!available} aria-label={`Reiniciar ${track.name}`}><ResetIcon/> Reiniciar</button></div>
      <div className="progress" aria-label={`${Math.round(progress)}% reproduzido`}><span style={{ width: `${progress}%` }}/></div>
      <div className="times"><span>{time(state.position)}</span><span>{time(state.duration)}</span></div>
      {!available && <small className="expected">Arquivo esperado: {track.fileName}</small>}
    </div>
  </article>
}
