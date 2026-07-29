import { useCallback, useEffect, useRef, useState } from 'react'
import { appConfig } from './config/appConfig'
import { treinoPlaylist, diretaoPlaylist, shotEffect } from './data/playlist'
import type { Track } from './data/playlist'
import { Splash } from './components/Splash'
import { InstallPrompt } from './components/InstallPrompt'
import { DiretaoIcon, TreinoIcon, ShotIcon, HamburgerIcon } from './components/Icons'
import { TrackCard, type TrackState } from './components/TrackCard'
import { Sidebar } from './components/Sidebar'
import { Inicio } from './pages/Inicio'
import { Quadrilheiros } from './pages/Quadrilheiros'
import { ParticipanteDetail } from './pages/ParticipanteDetail'
import { Frequencia } from './pages/Frequencia'
import { NotasAvaliacoes } from './pages/NotasAvaliacoes'
import { RankingPage } from './pages/RankingPage'
import { FolhaPagamento } from './pages/FolhaPagamento'
import { Sobre } from './pages/Sobre'

type Stored = { positions: Record<string, number>; completed: string[]; selected: string | null; page?: string }
const initialStored = (): Stored => { try { return JSON.parse(localStorage.getItem(appConfig.storageKey) || '') } catch { return { positions: {}, completed: [], selected: null, page: 'diretao' } } }

const allTracks = [...treinoPlaylist, ...diretaoPlaylist]

const PAGE_TITLES: Record<string, string> = {
  inicio: 'Início',
  quadrilheiros: 'Quadrilheiros',
  frequencia: 'Frequência',
  notas: 'Notas e Avaliações',
  ranking: 'Ranking',
  pagamento: 'Folha de Pagamento',
  sobre: 'Sobre o Aplicativo',
}

export default function App() {
  const stored = useRef(initialStored()).current
  const [splash, setSplash] = useState(true)
  const [page, setPage] = useState<'diretao' | 'treino' | 'info'>((stored.page as 'diretao' | 'treino') || 'diretao')
  const [infoPage, setInfoPage] = useState('inicio')
  const [active, setActive] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(stored.selected)
  const [finished, setFinished] = useState(false)
  const [shotFlash, setShotFlash] = useState(false)
  const [offlineReady, setOfflineReady] = useState(!navigator.onLine)
  const [states, setStates] = useState<Record<string, TrackState>>(() => Object.fromEntries(allTracks.map(t => [t.id, { position: stored.positions[t.id] || 0, duration: 0, completed: stored.completed.includes(t.id), loading: Boolean(t.audioPath), error: false }])))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const wake = useRef<WakeLockSentinel | null>(null)
  const shotRef = useRef<HTMLAudioElement | null>(null)
  const diretaoTimerRef = useRef<number | null>(null)
  const diretaoTimerTrackRef = useRef<string | null>(null)

  useEffect(() => { const timer = window.setTimeout(() => setSplash(false), appConfig.splashDuration); return () => clearTimeout(timer) }, [])
  useEffect(() => {
    const online = () => setOfflineReady(false), offline = () => setOfflineReady(true)
    window.addEventListener('online', online); window.addEventListener('offline', offline)
    if ('serviceWorker' in navigator) navigator.serviceWorker.ready.then(() => setOfflineReady(true)).catch(() => undefined)
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
  }, [])
  useEffect(() => {
    const positions = Object.fromEntries(Object.entries(states).map(([id, s]) => [id, s.position]))
    const persistPage = page === 'info' ? 'diretao' : page
    localStorage.setItem(appConfig.storageKey, JSON.stringify({ positions, completed: Object.entries(states).filter(([, s]) => s.completed).map(([id]) => id), selected, page: persistPage }))
  }, [states, selected, page])
  useEffect(() => {
    const manage = async () => { try { if (active && navigator.wakeLock) wake.current = await navigator.wakeLock.request('screen'); else if (wake.current) { await wake.current.release(); wake.current = null } } catch { /* recurso opcional */ } }
    void manage(); return () => { if (wake.current) void wake.current.release() }
  }, [active])
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const patchState = useCallback((id: string, patch: Partial<TrackState>) => setStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } })), [])
  const play = async (id: string) => {
    if (diretaoTimerRef.current !== null && diretaoTimerTrackRef.current !== id) {
      clearTimeout(diretaoTimerRef.current)
      diretaoTimerRef.current = null
      diretaoTimerTrackRef.current = null
    }
    const audio = audioRefs.current[id]; if (!audio) return
    navigator.vibrate?.(18); setFinished(false)
    if (active === id && !audio.paused) { audio.pause(); setActive(null); return }
    if (active) audioRefs.current[active]?.pause()
    setSelected(id)
    if (Math.abs(audio.currentTime - states[id].position) > 1) audio.currentTime = states[id].position
    try { await audio.play(); setActive(id); patchState(id, { error: false, loading: false }) } catch { patchState(id, { error: true, loading: false }); setActive(null) }
  }
  const reset = (id: string) => { const audio = audioRefs.current[id]; if (!audio) return; audio.currentTime = 0; patchState(id, { position: 0, completed: false }); navigator.vibrate?.(12) }
  const ended = async (id: string, trackList: Track[]) => {
    patchState(id, { completed: true }); setActive(null)
    const index = trackList.findIndex(t => t.id === id)
    for (let next = index + 1; next < trackList.length; next++) {
      if (trackList[next].audioPath) { document.getElementById(`track-${trackList[next].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); await play(trackList[next].id); return }
    }
    if (index === trackList.length - 1) setFinished(true)
  }
  const shoot = () => {
    navigator.vibrate?.([20, 20, 35]); setShotFlash(false); requestAnimationFrame(() => setShotFlash(true)); window.setTimeout(() => setShotFlash(false), 400)
    const audio = shotRef.current; if (audio) { audio.currentTime = 0; void audio.play().catch(() => undefined) }
    if (!active) return
    if (page === 'treino') {
      audioRefs.current[active]?.pause(); setActive(null)
    } else if (diretaoTimerRef.current === null) {
      const trackId = active
      diretaoTimerTrackRef.current = trackId
      diretaoTimerRef.current = window.setTimeout(() => {
        audioRefs.current[trackId]?.pause()
        if (active === trackId) setActive(null)
        diretaoTimerRef.current = null
        diretaoTimerTrackRef.current = null
      }, 2000)
    }
  }
  const navigateSidebar = useCallback((item: string) => {
    if (selectedParticipantId) setSelectedParticipantId(null)
    if (active) { audioRefs.current[active]?.pause(); setActive(null) }
    setPage('info')
    setInfoPage(item)
  }, [active])
  const changePage = (newPage: 'diretao' | 'treino') => {
    if (newPage === page) return
    if (diretaoTimerRef.current !== null) { clearTimeout(diretaoTimerRef.current); diretaoTimerRef.current = null; diretaoTimerTrackRef.current = null }
    if (active) { audioRefs.current[active]?.pause(); setActive(null) }
    setPage(newPage); setFinished(false)
    if (selectedParticipantId) setSelectedParticipantId(null)
  }
  const handleSelectParticipant = (id: string) => {
    setSelectedParticipantId(id)
    setInfoPage('quadrilheiros')
  }
  const handleBackToList = () => {
    setSelectedParticipantId(null)
  }

  if (splash) return <Splash />

  const isMusicPage = page === 'diretao' || page === 'treino'
  const headerTitle = isMusicPage ? (page === 'diretao' ? 'Diretão' : 'Modo Treino') : PAGE_TITLES[infoPage] || 'Início'

  const renderMusicContent = () => <>
    {page === 'diretao' ? <>
      <div className="section-title"><div><span>DIRETÃO</span><h2>Sequência contínua</h2></div><strong>2 FAIXAS</strong></div>
      <div className="playlist">{diretaoPlaylist.map(track => <TrackCard key={track.id} track={track} state={states[track.id]} playing={active === track.id} setAudioRef={(node) => { audioRefs.current[track.id] = node }} onToggle={() => void play(track.id)} onReset={() => reset(track.id)} onLoaded={() => { const a = audioRefs.current[track.id]; if (a) { if (states[track.id].position) a.currentTime = Math.min(states[track.id].position, a.duration || Infinity); patchState(track.id, { duration: a.duration, loading: false }) } }} onTime={() => { const a = audioRefs.current[track.id]; if (a) patchState(track.id, { position: a.currentTime, duration: a.duration || states[track.id].duration }) }} onEnded={() => void ended(track.id, diretaoPlaylist)} onError={() => patchState(track.id, { error: true, loading: false })} />)}</div>
    </> : <>
      <div className="section-title"><div><span>ORDEM OFICIAL</span><h2>Discos da apresentação</h2></div><strong>10 FAIXAS</strong></div>
      <div className="playlist">{treinoPlaylist.map(track => <TrackCard key={track.id} track={track} state={states[track.id]} playing={active === track.id} setAudioRef={(node) => { audioRefs.current[track.id] = node }} onToggle={() => void play(track.id)} onReset={() => reset(track.id)} onLoaded={() => { const a = audioRefs.current[track.id]; if (a) { if (states[track.id].position) a.currentTime = Math.min(states[track.id].position, a.duration || Infinity); patchState(track.id, { duration: a.duration, loading: false }) } }} onTime={() => { const a = audioRefs.current[track.id]; if (a) patchState(track.id, { position: a.currentTime, duration: a.duration || states[track.id].duration }) }} onEnded={() => void ended(track.id, treinoPlaylist)} onError={() => patchState(track.id, { error: true, loading: false })} />)}</div>
    </>}
    {finished && <div className="final-message">✦ {page === 'diretao' ? 'Diretão concluído' : 'Apresentação musical concluída'} ✦</div>}
  </>

  const renderInfoContent = () => {
    switch (infoPage) {
      case 'inicio': return <Inicio />
      case 'quadrilheiros':
        return selectedParticipantId
          ? <ParticipanteDetail participantId={selectedParticipantId} backToList={handleBackToList} />
          : <Quadrilheiros onSelectParticipant={handleSelectParticipant} backToList={handleBackToList} />
      case 'frequencia': return <Frequencia />
      case 'notas': return <NotasAvaliacoes />
      case 'ranking': return <RankingPage />
      case 'pagamento': return <FolhaPagamento />
      case 'sobre': return <Sobre />
      default: return <Inicio />
    }
  }

  return <div className="app-shell">
    <div className="campfire-watermark" aria-hidden="true"><svg viewBox="0 0 300 360"><g className="embers"><circle cx="75" cy="105" r="4"/><circle cx="230" cy="82" r="3"/><circle cx="196" cy="40" r="5"/><circle cx="103" cy="55" r="3"/></g><path className="flame-outer" d="M151 260C78 218 105 160 142 107c5 31 18 42 28 51 13-36 12-75 2-112 62 52 98 118 68 174-18 35-50 52-89 40Z"/><path className="flame-inner" d="M153 260c-42-28-28-72 7-110 1 24 12 33 22 43 8-17 12-31 10-48 29 37 24 91-39 115Z"/><path className="logs" d="m57 287 177 55M242 286 67 342"/></svg></div>
    <Sidebar activeItem={infoPage} onNavigate={navigateSidebar} onClose={() => setSidebarOpen(false)} open={sidebarOpen} />
    <header className="hero"><div className="flags" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
      <div className="hero-brand">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><HamburgerIcon /></button>
        <img src={appConfig.icons.favicon} alt=""/>
        <div><span>{appConfig.subtitle}</span><h1>{appConfig.name}</h1></div>
      </div>
      <div className="hero-meta"><span>{headerTitle}</span><span className={offlineReady ? 'offline-ready' : ''}>{offlineReady ? '● Pronto para uso offline' : '● Conectado'}</span></div>
      <InstallPrompt />
    </header>
    <main>
      {isMusicPage ? renderMusicContent() : renderInfoContent()}
      <footer><div className="footer-record"/><p>{appConfig.name}<br/><span>{appConfig.professor}</span></p><small>{appConfig.credit}</small></footer>
    </main>
    {shotEffect.audioPath && <audio ref={shotRef} src={shotEffect.audioPath} preload="auto"/>}<aside className={`shot-dock ${shotFlash ? 'fired' : ''}`}><div className="burst"/><button onClick={shoot} disabled={!shotEffect.audioPath}><ShotIcon/><span>EFEITO DE TIRO</span></button>{!shotEffect.audioPath && <small>Adicione "{shotEffect.fileName}" em audios</small>}</aside>
    <nav className="bottom-nav"><button className={page === 'diretao' ? 'active' : ''} onClick={() => changePage('diretao')}><DiretaoIcon/><span>Diretão</span></button><button className={page === 'treino' ? 'active' : ''} onClick={() => changePage('treino')}><TreinoIcon/><span>Modo Treino</span></button></nav>
  </div>
}
