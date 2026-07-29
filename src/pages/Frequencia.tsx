import { useEffect, useState } from 'react'
import { getAttendance } from '../services/api'
import type { AttendanceData } from '../services/api'
import { SearchIcon } from '../components/Icons'

export function Frequencia() {
  const now = new Date()
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'))
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<AttendanceData | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    getAttendance(month, year)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar as informações.'); setLoading(false) })
  }

  useEffect(() => { load() }, [month, year])

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>

  const participants = data?.participants || []
  const filtered = participants.filter(p => {
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'present' && p.presents === 0) return false
    if (filter === 'absent' && p.absences === 0) return false
    if (filter === 'late' && p.lates === 0) return false
    if (filter === 'justified' && p.justifieds === 0) return false
    return true
  })

  const summary = {
    total: participants.length,
    totalSessions: data?.totalSessions || 0,
    totalPresents: participants.reduce((s, p) => s + p.presents, 0),
    totalAbsences: participants.reduce((s, p) => s + p.absences, 0),
    totalLates: participants.reduce((s, p) => s + p.lates, 0),
    totalJustifieds: participants.reduce((s, p) => s + p.justifieds, 0),
  }

  return <div className="student-page frequencia-page">
    <h2 className="page-title">Frequência</h2>

    <div className="freq-filters">
      <label>Mês: <select value={month} onChange={e => setMonth(e.target.value)} className="admin-select">{[...Array(12)].map((_, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}</option>)}</select></label>
      <label>Ano: <select value={year} onChange={e => setYear(Number(e.target.value))} className="admin-select">{Array.from({ length: 3 }, (_, i) => 2025 + i).map(y => <option key={y} value={y}>{y}</option>)}</select></label>
    </div>

    <div className="freq-summary">
      <p>Ensaios realizados: {summary.totalSessions}</p>
      <div className="freq-summary-stats">
        <span>Presenças: {summary.totalPresents}</span>
        <span>Faltas: {summary.totalAbsences}</span>
        <span>Atrasos: {summary.totalLates}</span>
        <span>Justificativas: {summary.totalJustifieds}</span>
      </div>
      <p>Frequência geral: {summary.totalSessions > 0 ? Math.round((summary.totalPresents / (summary.totalSessions * summary.total)) * 100) : 0}%</p>
    </div>

    <div className="freq-search-filter">
      <div className="search-box"><SearchIcon /><input type="search" placeholder="Buscar participante..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
      <div className="filter-btns">
        {['all', 'present', 'absent', 'late', 'justified'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todos' : f === 'present' ? 'Presentes' : f === 'absent' ? 'Faltas' : f === 'late' ? 'Atrasos' : 'Justificados'}
          </button>
        ))}
      </div>
    </div>

    {filtered.length === 0
      ? <p className="empty-text">Nenhum participante encontrado.</p>
      : <div className="freq-table">
          {filtered.map(p => (
            <div key={p.id} className="freq-row">
              <span className="freq-name">{p.full_name}</span>
              <span className="freq-stat-num">{p.presents}P</span>
              <span className="freq-stat-num">{p.absences}F</span>
              <span className="freq-stat-num">{p.lates}A</span>
              <span className="freq-stat-num">{p.justifieds}J</span>
              <span className="freq-pct-cell">{p.frequency_pct}%</span>
            </div>
          ))}
        </div>}
  </div>
}
