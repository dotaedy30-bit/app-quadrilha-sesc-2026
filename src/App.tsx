import { useCallback, useEffect, useRef, useState } from 'react'
import { appConfig } from './config/appConfig'
import { playlist, shotEffect } from './data/playlist'
import { Splash } from './components/Splash'
import { InstallPrompt } from './components/InstallPrompt'
import { ShotIcon } from './components/Icons'
import { TrackCard, type TrackState } from './components/TrackCard'

type Stored = { positions: Record<string, number>; completed: string[]; selected: string | null }
const initialStored = (): Stored => { try { return JSON.parse(localStorage.getItem(appConfig.storageKey) || '') } catch { return { positions: {}, completed: [], selected: null } } }

export default function App() {
  const stored = useRef(initialStored()).current
  const [splash, setSplash] = useState(true)
  const [active, setActive] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(stored.selected)
  const [finished, setFinished] = useState(false)
  const [shotFlash, setShotFlash] = useState(false)
  const [offlineReady, setOfflineReady] = useState(!navigator.onLine)
  const [states, setStates] = useState<Record<string, TrackState>>(() => Object.fromEntries(playlist.map(t => [t.id, { position: stored.positions[t.id] || 0, duration: 0, completed: stored.completed.includes(t.id), loading: Boolean(t.audioPath), error: false }])))
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const wake = useRef<WakeLockSentinel | null>(null)
  const shotRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { const timer = window.setTimeout(() => setSplash(false), appConfig.splashDuration); return () => clearTimeout(timer) }, [])
  useEffect(() => {
    const online = () => setOfflineReady(false), offline = () => setOfflineReady(true)
    window.addEventListener('online', online); window.addEventListener('offline', offline)
    if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(() => setOfflineReady(true)).catch(() => undefined)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
  }, [])
  useEffect(() => {
    const positions = Object.fromEntries(Object.entries(states).map(([id, s]) => [id, s.position]))
    localStorage.setItem(appConfig.storageKey, JSON.stringify({ positions, completed: Object.entries(states).filter(([, s]) => s.completed).map(([id]) => id), selected }))
  }, [states, selected])
  useEffect(() => {
    const manage = async () => { try { if (active && navigator.wakeLock) wake.current = await navigator.wakeLock.request('screen'); else if (wake.current) { await wake.current.release(); wake.current = null } } catch { /* recurso opcional */ } }
    void manage(); return () => { if (wake.current) void wake.current.release() }
  }, [active])

  const patchState = useCallback((id: string, patch: Partial<TrackState>) => setStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } })), [])
  const play = async (id: string) => {
    const audio = audioRefs.current[id]; if (!audio) return
    navigator.vibrate?.(18); setFinished(false)
    if (active === id && !audio.paused) { audio.pause(); setActive(null); return }
    if (active) audioRefs.current[active]?.pause()
    setSelected(id)
    if (Math.abs(audio.currentTime - states[id].position) > 1) audio.currentTime = states[id].position
    try { await audio.play(); setActive(id); patchState(id, { error: false, loading: false }) } catch { patchState(id, { error: true, loading: false }); setActive(null) }
  }
  const reset = (id: string) => { const audio = audioRefs.current[id]; if (!audio) return; audio.currentTime = 0; patchState(id, { position: 0, completed: false }); navigator.vibrate?.(12) }
  const ended = async (id: string) => {
    patchState(id, { completed: true }); setActive(null)
    const index = playlist.findIndex(t => t.id === id)
    for (let next = index + 1; next < playlist.length; next++) {
      if (playlist[next].audioPath) { document.getElementById(`track-${playlist[next].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); await play(playlist[next].id); return }
    }
    if (index === playlist.length - 1) setFinished(true)
  }
  const shoot = () => {
    navigator.vibrate?.([20, 20, 35]); setShotFlash(false); requestAnimationFrame(() => setShotFlash(true)); window.setTimeout(() => setShotFlash(false), 400)
    if (active) { audioRefs.current[active]?.pause(); setActive(null) }
    const audio = shotRef.current; if (audio) { audio.currentTime = 0; void audio.play().catch(() => undefined) }
  }

  if (splash) return <Splash />
  return <div className="app-shell">
    <div className="campfire-watermark" aria-hidden="true"><svg viewBox="0 0 300 360"><g className="embers"><circle cx="75" cy="105" r="4"/><circle cx="230" cy="82" r="3"/><circle cx="196" cy="40" r="5"/><circle cx="103" cy="55" r="3"/></g><path className="flame-outer" d="M151 260C78 218 105 160 142 107c5 31 18 42 28 51 13-36 12-75 2-112 62 52 98 118 68 174-18 35-50 52-89 40Z"/><path className="flame-inner" d="M153 260c-42-28-28-72 7-110 1 24 12 33 22 43 8-17 12-31 10-48 29 37 24 91-39 115Z"/><path className="logs" d="m57 287 177 55M242 286 67 342"/></svg></div>
    <header className="hero"><div className="flags" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="hero-brand"><img src={appConfig.icons.favicon} alt=""/><div><span>{appConfig.subtitle}</span><h1>{appConfig.name}</h1></div></div><div className="hero-meta"><span>{appConfig.professor}</span><span className={offlineReady ? 'offline-ready' : ''}>{offlineReady ? '● Pronto para uso offline' : '● Conectado'}</span></div><InstallPrompt /></header>
    <main><div className="section-title"><div><span>ORDEM OFICIAL</span><h2>Discos da apresentação</h2></div><strong>10 FAIXAS</strong></div>
      <div className="playlist">{playlist.map(track => <TrackCard key={track.id} track={track} state={states[track.id]} playing={active === track.id} setAudioRef={(node) => { audioRefs.current[track.id] = node }} onToggle={() => void play(track.id)} onReset={() => reset(track.id)} onLoaded={() => { const a = audioRefs.current[track.id]; if (a) { if (states[track.id].position) a.currentTime = Math.min(states[track.id].position, a.duration || Infinity); patchState(track.id, { duration: a.duration, loading: false }) } }} onTime={() => { const a = audioRefs.current[track.id]; if (a) patchState(track.id, { position: a.currentTime, duration: a.duration || states[track.id].duration }) }} onEnded={() => void ended(track.id)} onError={() => patchState(track.id, { error: true, loading: false })} />)}</div>
      {finished && <div className="final-message">✦ Apresentação musical concluída ✦</div>}
      <footer><div className="footer-record"/><p>{appConfig.name}<br/><span>{appConfig.professor}</span></p><small>{appConfig.credit}</small></footer>
    </main>
    {shotEffect.audioPath && <audio ref={shotRef} src={shotEffect.audioPath} preload="auto"/>}<aside className={`shot-dock ${shotFlash ? 'fired' : ''}`}><div className="burst"/><button onClick={shoot} disabled={!shotEffect.audioPath}><ShotIcon/><span>EFEITO DE TIRO</span></button>{!shotEffect.audioPath && <small>Adicione “{shotEffect.fileName}” em audios</small>}</aside>
  </div>
}
