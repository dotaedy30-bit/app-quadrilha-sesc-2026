import { useEffect, useState } from 'react'
import { getParticipantDetail } from '../services/api'
import type { ParticipantDetail as Detail } from '../services/api'
import { ArrowUpIcon, ArrowDownIcon } from '../components/Icons'

interface Props {
  participantId: string
  backToList: () => void
}

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

export function ParticipanteDetail({ participantId, backToList }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(now.getFullYear())

  const load = () => {
    setLoading(true)
    setError('')
    getParticipantDetail(participantId, month, year)
      .then(data => { setDetail(data); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar as informações.'); setLoading(false) })
  }

  useEffect(() => { load() }, [participantId, month, year])

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>
  if (!detail) return <div className="student-page"><p className="empty-text">Participante não encontrado.</p></div>

  const { participant, attendance, evaluation, scores, ranking, previousEvaluation, absentDates } = detail
  const levelColor = evaluation ? LEVEL_COLORS[evaluation.level] || '#b09587' : '#b09587'
  const prevAvg = previousEvaluation?.average

  return <div className="student-page participante-detail-page">
    <button className="back-btn" onClick={backToList}>← Voltar</button>
    <div className="detail-header">
      <div className="detail-avatar">{participant.full_name.charAt(0)}</div>
      <div>
        <h2 className="page-title">{participant.full_name}</h2>
        <p className="detail-subtitle">Quadrilheiro ativo desde {new Date(participant.joined_at + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
      </div>
    </div>

    <div className="detail-month-picker">
      <label>Mês: <select value={month} onChange={e => setMonth(e.target.value)} className="admin-select">{[...Array(12)].map((_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}</select></label>
      <label>Ano: <select value={year} onChange={e => setYear(Number(e.target.value))} className="admin-select">{Array.from({ length: 3 }, (_, i) => 2025 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></label>
    </div>

    <div className="detail-section">
      <h3>Frequência Mensal</h3>
      <div className="freq-stats">
        <div className="freq-stat"><span className="freq-num">{attendance.presents}</span><span className="freq-label">Presenças</span></div>
        <div className="freq-stat"><span className="freq-num">{attendance.absences}</span><span className="freq-label">Faltas</span></div>
        <div className="freq-stat"><span className="freq-num">{attendance.lates}</span><span className="freq-label">Atrasos</span></div>
        <div className="freq-stat"><span className="freq-num">{attendance.justifieds}</span><span className="freq-label">Justificadas</span></div>
      </div>
      <div className="freq-bar"><div className="freq-bar-fill" style={{ width: `${attendance.frequency_pct}%` }} /></div>
      <p className="freq-pct">{attendance.frequency_pct}% de frequência</p>
      {absentDates.length > 0 && <div className="absent-dates">
        <strong>Faltas em:</strong> {absentDates.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')).join(', ')}
      </div>}
    </div>

    <div className="detail-section">
      <h3>Avaliação</h3>
      {evaluation
        ? <>
            <div className="eval-score-display" style={{ color: levelColor }}>
              <span className="eval-score-big">{evaluation.average.toFixed(1)}</span>
              <span className="eval-level-badge" style={{ background: levelColor + '22', color: levelColor, borderColor: levelColor }}>{LEVEL_LABELS[evaluation.level] || evaluation.level}</span>
            </div>
            {prevAvg !== undefined && prevAvg !== null && <p className="eval-evolution">Mês anterior: {prevAvg.toFixed(1)} {evaluation.average > prevAvg ? <ArrowUpIcon /> : evaluation.average < prevAvg ? <ArrowDownIcon /> : null}</p>}
            {scores.length > 0 && <div className="scores-list">
              {scores.map((s, i) => <div key={i} className="score-row"><span className="score-name">{s.criterion_name}</span><span className="score-value">{s.score.toFixed(1)}</span></div>)}
            </div>}
            {evaluation.public_observation && <p className="public-obs">{evaluation.public_observation}</p>}
          </>
        : <p className="empty-text">Sem avaliação publicada para este mês.</p>}
    </div>

    {ranking && <div className="detail-section">
      <h3>Ranking</h3>
      <p><strong>Posição:</strong> #{ranking.position}</p>
      <p><strong>Pontuação:</strong> {ranking.score.toFixed(2)}</p>
      <p><strong>Nível:</strong> {LEVEL_LABELS[ranking.level] || ranking.level}</p>
      {ranking.position_change !== null && ranking.position_change !== 0 && <p><strong>Variação:</strong> {ranking.position_change > 0 ? `Subiu ${ranking.position_change} posição(ões)` : `Desceu ${Math.abs(ranking.position_change)} posição(ões)`}</p>}
    </div>}

    {!ranking && <div className="detail-section">
      <h3>Ranking</h3>
      <p className="empty-text">Ranking ainda não publicado.</p>
    </div>}
  </div>
}
