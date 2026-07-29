import { useEffect, useState } from 'react'
import { getEvaluations, getEvaluationDetail } from '../services/api'
import type { EvaluationData, EvaluationDetail as EvalDetail } from '../services/api'

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

export function NotasAvaliacoes() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<EvaluationData | null>(null)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<EvalDetail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    setSelectedId(null)
    setSelectedDetail(null)
    getEvaluations(month, year)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar as informações.'); setLoading(false) })
  }

  useEffect(() => { load() }, [month, year])

  const openDetail = (id: string) => {
    setSelectedId(id)
    setDetailLoading(true)
    getEvaluationDetail(id)
      .then(d => { setSelectedDetail(d); setDetailLoading(false) })
      .catch(() => { setDetailLoading(false) })
  }

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>

  if (selectedDetail) {
    const evalData = selectedDetail
    const levelColor = LEVEL_COLORS[evalData.level] || '#b09587'
    return <div className="student-page avaliacao-detail-page">
      <button className="back-btn" onClick={() => { setSelectedId(null); setSelectedDetail(null) }}>← Voltar</button>
      <h2 className="page-title">{evalData.participant_name}</h2>
      <p className="page-subtitle">{evalData.month}/{evalData.year}</p>

      <div className="eval-score-display" style={{ color: levelColor }}>
        <span className="eval-score-big">{evalData.average.toFixed(1)}</span>
        <span className="eval-level-badge" style={{ background: levelColor + '22', color: levelColor, borderColor: levelColor }}>{LEVEL_LABELS[evalData.level] || evalData.level}</span>
      </div>

      {evalData.previousEvaluation && <p className="eval-comparison">Mês anterior: {evalData.previousEvaluation.average.toFixed(1)} ({LEVEL_LABELS[evalData.previousEvaluation.level] || evalData.previousEvaluation.level})</p>}

      <div className="scores-grid">
        {evalData.scores.map((s, i) => <div key={i} className="score-card"><span className="score-name">{s.criterion_name}</span><span className="score-val">{s.score.toFixed(1)}</span></div>)}
      </div>

      {evalData.public_observation && <div className="public-obs"><strong>Observação:</strong> {evalData.public_observation}</div>}
    </div>
  }

  const evaluations = data?.evaluations || []
  const filtered = search ? evaluations.filter(e => e.participant_name.toLowerCase().includes(search.toLowerCase())) : evaluations

  return <div className="student-page notas-page">
    <h2 className="page-title">Notas e Avaliações</h2>
    <div className="freq-filters">
      <label>Mês: <select value={month} onChange={e => setMonth(e.target.value)} className="admin-select">{[...Array(12)].map((_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}</select></label>
      <label>Ano: <select value={year} onChange={e => setYear(Number(e.target.value))} className="admin-select">{Array.from({ length: 3 }, (_, i) => 2025 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></label>
    </div>
    <div className="search-box"><input type="search" placeholder="Buscar participante..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>

    {filtered.length === 0
      ? <p className="empty-text">Nenhuma avaliação publicada para este mês.</p>
      : <div className="eval-list">
          {filtered.map(e => (
            <button key={e.id} className={`eval-card ${selectedId === e.id ? 'active' : ''}`} onClick={() => openDetail(e.id)}>
              {detailLoading && selectedId === e.id ? <span className="loading-spinner small" /> :
                <><span className="eval-card-name">{e.participant_name}</span>
                <span className="eval-card-score">{e.average.toFixed(1)}</span></>}
            </button>
          ))}
        </div>}
  </div>
}
