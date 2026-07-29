import { useEffect, useState } from 'react'
import { appConfig } from '../config/appConfig'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function Sobre() {
  const [installable, setInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') setInstallable(false)
    setDeferredPrompt(null)
  }

  return <div className="student-page sobre-page">
    <h2 className="page-title">Sobre o Aplicativo</h2>

    <div className="sobre-card">
      <h3>{appConfig.name}</h3>
      <p><strong>Professor:</strong> {appConfig.professor}</p>
      <p><strong>Autor:</strong> {appConfig.author}</p>
    </div>

    <div className="sobre-card">
      <h3>Ensaios</h3>
      <p><strong>Dias:</strong> Segunda e quarta-feira</p>
      <p><strong>Horário:</strong> 18h às 20h</p>
    </div>

    <div className="sobre-card">
      <h3>Informações do Aplicativo</h3>
      <p><strong>Versão:</strong> 1.0.0</p>
      <p><strong>Nome:</strong> {appConfig.shortName}</p>
      <p><strong>Modo:</strong> Público - Alunos</p>
      <p>Este aplicativo funciona offline para as músicas e dados previamente carregados.</p>
    </div>

    {installable && <button className="install-button" onClick={handleInstall}>
      Instalar aplicativo
    </button>}
  </div>
}
