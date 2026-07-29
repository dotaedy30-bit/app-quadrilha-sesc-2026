import { useEffect, useState } from 'react'
import { getParticipants } from '../services/api'
import type { PublicParticipant } from '../services/api'

interface Props {
  onSelectParticipant: (id: string) => void
  backToList: () => void
}

export function Quadrilheiros({ onSelectParticipant }: Props) {
  const [participants, setParticipants] = useState<PublicParticipant[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    getParticipants()
      .then(data => { setParticipants(data); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar as informações agora.'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = participants.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>

  return <div className="student-page quadrilheiros-page">
    <div className="page-header">
      <h2 className="page-title">Quadrilheiros</h2>
      <span className="total-badge">{participants.length} participantes</span>
    </div>
    <div className="search-box">
      <input type="search" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
    </div>
    {filtered.length === 0
      ? <p className="empty-text">Nenhum participante encontrado.</p>
      : <div className="participant-grid">
          {filtered.map(p => (
            <button key={p.id} className="participant-card" onClick={() => onSelectParticipant(p.id)}>
              <div className="participant-avatar">{p.full_name.charAt(0)}</div>
              <div className="participant-info">
                <strong>{p.full_name}</strong>
                <span className="participant-freq">Frequência: {p.frequency_pct}%</span>
              </div>
            </button>
          ))}
        </div>}
  </div>
}
