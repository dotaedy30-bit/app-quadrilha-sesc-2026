import { useEffect, useState } from 'react'
import { getRanking } from '../services/api'
import type { RankingData } from '../services/api'

const LEVEL_LABELS: Record<string, string> = {
  needs_support: 'Precisa de mais acompanhamento',
  developing: 'Em desenvolvimento',
  evolving: 'Evolução constante',
  good: 'Bom desempenho',
  very_good: 'Muito bom desempenho',
  outstanding: 'Destaque da quadrilha',
}

const LEVEL_COLORS: Record<string, string> = {
  needs_support: '#c9433d',
  developing: '#e8a84c',
  evolving: '#42cbe1',
  good: '#4d9c69',
  very_good: '#2589e8',
  outstanding: '#8e54d9',
}

export function RankingPage() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<RankingData | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    getRanking(month, year)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar as informações.'); setLoading(false) })
  }

  useEffect(() => { load() }, [month, year])

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>

  const entries = data?.entries || []

  if (entries.length === 0) return <div className="student-page ranking-page">
    <h2 className="page-title">Ranking</h2>
    <div className="freq-filters">
      <label>Mês: <select value={month} onChange={e => setMonth(e.target.value)} className="admin-select">{[...Array(12)].map((_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}</select></label>
      <label>Ano: <select value={year} onChange={e => setYear(Number(e.target.value))} className="admin-select">{Array.from({ length: 3 }, (_, i) => 2025 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></label>
    </div>
    <p className="empty-text">Ranking deste mês ainda não publicado.</p>
  </div>

  const filtered = search ? entries.filter(e => e.participant_name.toLowerCase().includes(search.toLowerCase())) : entries

  return <div className="student-page ranking-page">
    <h2 className="page-title">Ranking</h2>
    <div className="freq-filters">
      <label>Mês: <select value={month} onChange={e => setMonth(e.target.value)} className="admin-select">{[...Array(12)].map((_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}</select></label>
      <label>Ano: <select value={year} onChange={e => setYear(Number(e.target.value))} className="admin-select">{Array.from({ length: 3 }, (_, i) => 2025 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></label>
    </div>
    <div className="search-box"><input type="search" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>

    <div className="ranking-table">
      {filtered.map((e, i) => {
        const levelColor = LEVEL_COLORS[e.level] || '#b09587'
        return <div key={i} className={`ranking-row ${i < 3 ? 'top-three' : ''}`}>
          <span className="rank-pos">#{e.position}</span>
          <span className="rank-name">{e.participant_name}</span>
          <span className="rank-score">{e.average_score.toFixed(1)}</span>
          <span className="rank-level" style={{ color: levelColor }}>{LEVEL_LABELS[e.level] || e.level}</span>
          {e.position_change !== null && e.position_change !== 0 && <span className="rank-change">{e.position_change > 0 ? `▲${e.position_change}` : `▼${Math.abs(e.position_change)}`}</span>}
        </div>
      })}
    </div>
  </div>
}
