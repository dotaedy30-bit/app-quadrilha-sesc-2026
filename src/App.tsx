import { useCallback, useEffect, useRef, useState } from 'react'
import { appConfig } from './config/appConfig'
import { diretaoPlaylist, diretaoTemporarioPlaylist, shotEffect, treinoPlaylist, treinoTemporarioPlaylist } from './data/playlist'
import type { Track } from './data/playlist'
import { Splash } from './components/Splash'
import { InstallPrompt } from './components/InstallPrompt'
import { CloseIcon, DiretaoIcon, HamburgerIcon, ShotIcon, TreinoIcon } from './components/Icons'
import { TrackCard, type TrackState } from './components/TrackCard'

type MusicPage = 'diretao-official' | 'treino-official' | 'diretao-temporary' | 'treino-temporary'
type Stored = { positions: Record<string, number>; completed: string[]; selected: string | null; page?: string }

const initialStored = (): Stored => {
  try { return JSON.parse(localStorage.getItem(appConfig.storageKey) || '') }
  catch { return { positions: {}, completed: [], selected: null, page: 'diretao-official' } }
}

const pageFromStorage = (page?: string): MusicPage => {
  if (page === 'treino' || page === 'treino-official') return 'treino-official'
  if (page === 'diretao-temporary') return 'diretao-temporary'
  if (page === 'treino-temporary') return 'treino-temporary'
  return 'diretao-official'
}

const isTrainingPage = (page: MusicPage) => page === 'treino-official' || page === 'treino-temporary'
const isOfficialPage = (page: MusicPage) => page === 'diretao-official' || page === 'treino-official'
const allTracks = [...treinoPlaylist, ...diretaoPlaylist, ...diretaoTemporarioPlaylist, ...treinoTemporarioPlaylist]

export default function App() {
  const stored = useRef(initialStored()).current
  const [splash, setSplash] = useState(true)
  const [page, setPage] = useState<MusicPage>(() => pageFromStorage(stored.page))
  const [active, setActive] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(stored.selected)
  const [finished, setFinished] = useState(false)
  const [shotFlash, setShotFlash] = useState(false)
  const [offlineReady, setOfflineReady] = useState(!navigator.onLine)
  const [futureModalOpen, setFutureModalOpen] = useState(false)
  const [states, setStates] = useState<Record<string, TrackState>>(() => Object.fromEntries(allTracks.map(track => [track.id, { position: stored.positions[track.id] || 0, duration: 0, completed: stored.completed.includes(track.id), loading: Boolean(track.audioPath), error: false }])))
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const wake = useRef<WakeLockSentinel | null>(null)
  const shotRef = useRef<HTMLAudioElement | null>(null)
  const diretaoTimerRef = useRef<number | null>(null)
  const diretaoTimerTrackRef = useRef<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), appConfig.splashDuration)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const online = () => setOfflineReady(false)
    const offline = () => setOfflineReady(true)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(() => setOfflineReady(true)).catch(() => undefined)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
  }, [])

  useEffect(() => {
    const positions = Object.fromEntries(Object.entries(states).map(([id, state]) => [id, state.position]))
    localStorage.setItem(appConfig.storageKey, JSON.stringify({ positions, completed: Object.entries(states).filter(([, state]) => state.completed).map(([id]) => id), selected, page }))
  }, [states, selected, page])

  useEffect(() => {
    const manage = async () => {
      try {
        if (active && navigator.wakeLock) wake.current = await navigator.wakeLock.request('screen')
        else if (wake.current) { await wake.current.release(); wake.current = null }
      } catch { /* recurso opcional */ }
    }
    void manage()
    return () => { if (wake.current) void wake.current.release() }
  }, [active])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') setFutureModalOpen(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const patchState = useCallback((id: string, patch: Partial<TrackState>) => setStates(previous => ({ ...previous, [id]: { ...previous[id], ...patch } })), [])

  const seekTo = useCallback((id: string, percent: number) => {
  const audio = audioRefs.current[id]
  if (!audio) return
  const duration = audio.duration
  if (!Number.isFinite(duration) || duration <= 0) return
  const newTime = Math.max(0, Math.min(percent * duration, duration))
  audio.currentTime = newTime
  patchState(id, { position: newTime })
}, [patchState])

const play = async (id: string) => {
    if (diretaoTimerRef.current !== null && diretaoTimerTrackRef.current !== id) {
      clearTimeout(diretaoTimerRef.current)
      diretaoTimerRef.current = null
      diretaoTimerTrackRef.current = null
    }
    const audio = audioRefs.current[id]
    if (!audio) return
    navigator.vibrate?.(18)
    setFinished(false)
    if (active === id && !audio.paused) { audio.pause(); setActive(null); return }
    if (active) audioRefs.current[active]?.pause()
    setSelected(id)
    if (Math.abs(audio.currentTime - states[id].position) > 1) audio.currentTime = states[id].position
    try { await audio.play(); setActive(id); patchState(id, { error: false, loading: false }) }
    catch { patchState(id, { error: true, loading: false }); setActive(null) }
  }

  const reset = (id: string) => {
    const audio = audioRefs.current[id]
    if (!audio) return
    audio.currentTime = 0
    patchState(id, { position: 0, completed: false })
    navigator.vibrate?.(12)
  }

  const ended = async (id: string, trackList: Track[]) => {
    patchState(id, { completed: true })
    setActive(null)
    const index = trackList.findIndex(track => track.id === id)
    for (let next = index + 1; next < trackList.length; next++) {
      if (trackList[next].audioPath) {
        document.getElementById(`track-${trackList[next].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await play(trackList[next].id)
        return
      }
    }
    if (index === trackList.length - 1) setFinished(true)
  }

  const shoot = () => {
    navigator.vibrate?.([20, 20, 35])
    setShotFlash(false)
    requestAnimationFrame(() => setShotFlash(true))
    window.setTimeout(() => setShotFlash(false), 400)
    const audio = shotRef.current
    if (audio) { audio.currentTime = 0; void audio.play().catch(() => undefined) }
    if (!active) return
    if (isTrainingPage(page)) {
      audioRefs.current[active]?.pause()
      setActive(null)
    } else if (diretaoTimerRef.current === null) {
      const trackId = active
      diretaoTimerTrackRef.current = trackId
      diretaoTimerRef.current = window.setTimeout(() => {
        audioRefs.current[trackId]?.pause()
        setActive(current => current === trackId ? null : current)
        diretaoTimerRef.current = null
        diretaoTimerTrackRef.current = null
      }, 2000)
    }
  }

  const changePage = (nextPage: MusicPage) => {
    if (nextPage === page) return
    if (diretaoTimerRef.current !== null) {
      clearTimeout(diretaoTimerRef.current)
      diretaoTimerRef.current = null
      diretaoTimerTrackRef.current = null
    }
    if (active) { audioRefs.current[active]?.pause(); setActive(null) }
    setPage(nextPage)
    setFinished(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (splash) return <Splash />

  const training = isTrainingPage(page)
  const official = isOfficialPage(page)
  const canUseShot = page === 'diretao-official'
  const headerTitle = page === 'diretao-official' ? 'Diretão Oficial'
    : page === 'treino-official' ? 'Modo Treino Oficial'
      : page === 'diretao-temporary' ? 'Diretão Temporário'
        : 'Modo Treino — Diretão Temporário'
  const modePage = official ? 'treino-official' : 'treino-temporary'
  const diretaoPage = official ? 'diretao-official' : 'diretao-temporary'
  const tracks = page === 'diretao-official' ? diretaoPlaylist
    : page === 'treino-official' ? treinoPlaylist
      : page === 'diretao-temporary' ? diretaoTemporarioPlaylist
        : treinoTemporarioPlaylist
  const sectionEyebrow = page === 'diretao-official' ? 'DIRETÃO OFICIAL'
    : page === 'treino-official' ? 'ORDEM OFICIAL'
      : page === 'diretao-temporary' ? 'DIRETÃO TEMPORÁRIO'
        : 'MODO TREINO TEMPORÁRIO'
  const sectionTitle = page === 'diretao-official' ? 'Sequência contínua'
    : page === 'treino-official' ? 'Discos da apresentação'
      : page === 'diretao-temporary' ? 'Dois discos para ensaiar'
        : 'Sequência de ensaio'
  const countLabel = page === 'diretao-temporary' ? '2 DISCOS' : page === 'treino-temporary' ? '6 MÚSICAS' : `${tracks.length} FAIXAS`

  return <div className="app-shell">
    <div className="campfire-watermark" aria-hidden="true"><svg viewBox="0 0 300 360"><g className="embers"><circle cx="75" cy="105" r="4"/><circle cx="230" cy="82" r="3"/><circle cx="196" cy="40" r="5"/><circle cx="103" cy="55" r="3"/></g><path className="flame-outer" d="M151 260C78 218 105 160 142 107c5 31 18 42 28 51 13-36 12-75 2-112 62 52 98 118 68 174-18 35-50 52-89 40Z"/><path className="flame-inner" d="M153 260c-42-28-28-72 7-110 1 24 12 33 22 43 8-17 12-31 10-48 29 37 24 91-39 115Z"/><path className="logs" d="m57 287 177 55M242 286 67 342"/></svg></div>
    <header className="hero">
      <div className="flags" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
      <div className="hero-brand">
        <button className="hamburger-btn" onClick={() => setFutureModalOpen(true)} aria-label="Ver novidades planejadas para 2027"><HamburgerIcon /></button>
        <img src={appConfig.icons.favicon} alt=""/>
        <div><span>{appConfig.subtitle}</span><h1>{appConfig.name}</h1></div>
      </div>
      <div className="music-spa-toolbar">
        {training ? <button className="music-header-button back" onClick={() => changePage(diretaoPage)}><span aria-hidden="true">←</span> Voltar</button> : <span className="music-header-spacer" aria-hidden="true"/>}
        <strong>{headerTitle}</strong>
        {!training ? <button className="music-header-button" onClick={() => changePage(modePage)}><TreinoIcon /> Modo Treino</button> : <span className="music-header-spacer" aria-hidden="true"/>}
      </div>
      <div className="hero-meta"><span className={offlineReady ? 'offline-ready' : ''}>{offlineReady ? '● Pronto para uso offline' : '● Conectado'}</span></div>
      <InstallPrompt />
    </header>
    <main>
      <section className="music-spa" aria-label={headerTitle}>
        <div className="section-title"><div><span>{sectionEyebrow}</span><h2>{sectionTitle}</h2></div><strong>{countLabel}</strong></div>
        <div className="playlist">{tracks.map(track => <TrackCard key={track.id} track={track} state={states[track.id]} playing={active === track.id} setAudioRef={(node) => { audioRefs.current[track.id] = node }} onSeek={(id, p) => seekTo(id, p)} onToggle={() => void play(track.id)} onReset={() => reset(track.id)} onLoaded={() => { const audio = audioRefs.current[track.id]; if (audio) { if (states[track.id].position) audio.currentTime = Math.min(states[track.id].position, audio.duration || Infinity); patchState(track.id, { duration: audio.duration, loading: false }) } }} onTime={() => { const audio = audioRefs.current[track.id]; if (audio) patchState(track.id, { position: audio.currentTime, duration: audio.duration || states[track.id].duration }) }} onEnded={() => void ended(track.id, tracks)} onError={() => patchState(track.id, { error: true, loading: false })} />)}</div>
        {finished && <div className="final-message">✦ {training ? 'Sequência de treino concluída' : 'Diretão concluído'} ✦</div>}
      </section>
      <footer><div className="footer-record"/><p>{appConfig.name}<br/><span>{appConfig.professor}</span></p><small>{appConfig.credit}</small></footer>
    </main>
    {canUseShot && shotEffect.audioPath && <audio ref={shotRef} src={shotEffect.audioPath} preload="auto"/>}
    {canUseShot && <aside className={`shot-dock ${shotFlash ? 'fired' : ''}`}><div className="burst"/><button onClick={shoot} disabled={!shotEffect.audioPath}><ShotIcon/><span>EFEITO DE TIRO</span></button>{!shotEffect.audioPath && <small>Adicione "{shotEffect.fileName}" em audios</small>}</aside>}
    {!training && <nav className="bottom-nav" aria-label="Experiências musicais">
      <button className={official ? 'active' : ''} onClick={() => changePage('diretao-official')} aria-current={official ? 'page' : undefined}><DiretaoIcon/><span>Diretão Oficial</span></button>
      <button className={!official ? 'active' : ''} onClick={() => changePage('diretao-temporary')} aria-current={!official ? 'page' : undefined}><DiretaoIcon/><span>Diretão Temporário</span></button>
    </nav>}
    {futureModalOpen && <div className="future-modal-backdrop" role="presentation" onMouseDown={() => setFutureModalOpen(false)}>
      <section className="future-modal" role="dialog" aria-modal="true" aria-labelledby="future-modal-title" onMouseDown={event => event.stopPropagation()}>
        <button className="future-modal-close" onClick={() => setFutureModalOpen(false)} aria-label="Fechar novidades"><CloseIcon /></button>
        <span className="future-modal-kicker">QUADRILHA DO SESC</span>
        <h2 id="future-modal-title">Novidades a caminho — 2027</h2>
        <p>O aplicativo da Quadrilha do Sesc está sendo preparado para ficar ainda mais completo.</p>
        <p>Em uma próxima atualização, ele poderá acompanhar presença, faltas, atrasos, dias e horários dos ensaios, desempenho, evolução, dedicação, metas, ranking, pontuação de participação e as músicas combinadas.</p>
        <p>A participação, a dedicação, a evolução e a assiduidade poderão contribuir para uma pontuação de acompanhamento. Faltas e outros critérios definidos pela equipe também poderão influenciar essa pontuação.</p>
        <p className="future-modal-note">Essa é uma novidade planejada para 2027. Por enquanto, aproveite o aplicativo musical da Quadrilha do Sesc 2026.</p>
        <button className="future-modal-primary" onClick={() => setFutureModalOpen(false)}>Voltar para o aplicativo</button>
      </section>
    </div>}
  </div>
}
