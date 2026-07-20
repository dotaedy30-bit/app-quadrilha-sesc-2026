import { useEffect, useRef, useState } from 'react'
import { DownloadIcon, ShareIcon } from './Icons'

const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function InstallPrompt() {
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [nativeReady, setNativeReady] = useState(false)
  const [installed, setInstalled] = useState(standalone)
  const [tutorial, setTutorial] = useState(false)
  const ios = isIOS()
  const ipad = /iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)')
    const sync = () => { if (standalone()) { setInstalled(true); setTutorial(false) } }
    const ready = (event: Event) => { event.preventDefault(); promptRef.current = event as BeforeInstallPromptEvent; setNativeReady(true) }
    const done = () => { promptRef.current = null; setNativeReady(false); setInstalled(true); setTutorial(false) }
    window.addEventListener('beforeinstallprompt', ready); window.addEventListener('appinstalled', done); media.addEventListener?.('change', sync)
    return () => { window.removeEventListener('beforeinstallprompt', ready); window.removeEventListener('appinstalled', done); media.removeEventListener?.('change', sync) }
  }, [])
  if (installed || (!ios && !nativeReady)) return null
  const install = async () => {
    if (ios) { setTutorial(true); return }
    const prompt = promptRef.current; if (!prompt) return
    await prompt.prompt(); await prompt.userChoice
    promptRef.current = null; setNativeReady(false)
  }
  return <>
    <button className="install-button install-ready" onClick={() => void install()}><DownloadIcon />{ios ? `Instalar no ${ipad ? 'iPad' : 'iPhone'}` : 'Baixar aplicativo'}</button>
    {ios && tutorial && <div className="sheet-backdrop" onClick={() => setTutorial(false)}><section className="install-sheet" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(e) => e.stopPropagation()}><div className="sheet-handle"/><ShareIcon className="share-hero"/><h2 id="install-title">Leve o roteiro com você</h2><ol><li>Abra este aplicativo pelo <strong>Safari</strong>.</li><li>Toque no botão <strong>Compartilhar</strong> <ShareIcon/>.</li><li>Escolha <strong>Adicionar à Tela de Início</strong>.</li><li>Toque em <strong>Adicionar</strong>.</li></ol><button onClick={() => setTutorial(false)}>Entendi</button></section></div>}
  </>
}
