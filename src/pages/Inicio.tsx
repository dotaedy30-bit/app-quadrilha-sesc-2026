import { useEffect, useState } from 'react'
import { getDashboard, getPayrollStatus } from '../services/api'
import type { DashboardData, PayrollStatus } from '../services/api'
import { appConfig } from '../config/appConfig'

export function Inicio() {
  const [dash, setDash] = useState<DashboardData | null>(null)
  const [payroll, setPayroll] = useState<PayrollStatus | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([getDashboard(), getPayrollStatus()])
      .then(([d, p]) => { setDash(d); setPayroll(p); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar essas informações agora. As músicas continuam disponíveis normalmente.'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>

  const isPayrollReleased = payroll && (payroll.status === 'released_for_signature' || payroll.status === 'signing_in_progress')

  return <div className="student-page inicio-page">
    <h2 className="page-title">Início</h2>

    {isPayrollReleased && <div className="payroll-alert">
      <strong>Folha de pagamento liberada.</strong> Compareça ao Sesc para assinar obrigatoriamente.
    </div>}

    <div className="inicio-cards">
      <div className="inicio-card">
        <span className="inicio-card-value">{dash?.activeParticipants ?? 0}</span>
        <span className="inicio-card-label">Quadrilheiros ativos</span>
      </div>
      <div className="inicio-card">
        <span className="inicio-card-value">{appConfig.rehearsalDays.length}</span>
        <span className="inicio-card-label">Ensaios por semana</span>
      </div>
      <div className="inicio-card">
        <span className="inicio-card-value">{appConfig.rehearsalDays[0]}</span>
        <span className="inicio-card-label">Dias de ensaio</span>
      </div>
      <div className="inicio-card">
        <span className="inicio-card-value">{appConfig.rehearsalTime}</span>
        <span className="inicio-card-label">Horário</span>
      </div>
    </div>

    <div className="inicio-info">
      <h3>Próximo Ensaio</h3>
      <p>Segunda e quarta-feira, das {appConfig.rehearsalTime}</p>
    </div>

    {dash?.lastFinalizedSession && <div className="inicio-info">
      <h3>Última Chamada</h3>
      <p>Data: {new Date(dash.lastFinalizedSession.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
      {dash.lastSessionStats && <p>Presentes: {dash.lastSessionStats.presents} | Faltas: {dash.lastSessionStats.absences} | Atrasos: {dash.lastSessionStats.lates}</p>}
    </div>}

    {!dash?.lastFinalizedSession && <div className="inicio-info">
      <h3>Última Chamada</h3>
      <p className="empty-text">Nenhuma chamada publicada ainda.</p>
    </div>}

    <div className="inicio-info">
      <h3>Avaliações</h3>
      {dash && dash.averageScore > 0
        ? <p>Média geral: {dash.averageScore.toFixed(1)}</p>
        : <p className="empty-text">Avaliações ainda não publicadas.</p>}
    </div>

    <div className="inicio-info">
      <h3>Ranking</h3>
      {dash?.latestPublishedRanking
        ? <p>Ranking de {dash.latestPublishedRanking.month}/{dash.latestPublishedRanking.year} publicado.</p>
        : <p className="empty-text">Ranking deste mês ainda não disponível.</p>}
    </div>

    <div className="inicio-info">
      <h3>Folha de Pagamento</h3>
      {payroll
        ? <p>Status: {STATUS_LABELS[payroll.status as keyof typeof STATUS_LABELS] || payroll.status}</p>
        : <p className="empty-text">Nenhuma folha de pagamento disponível.</p>}
    </div>
  </div>
}

const STATUS_LABELS = {
  waiting: 'Em espera',
  released_for_signature: 'Liberada para assinatura',
  signing_in_progress: 'Assinaturas em andamento',
  signatures_completed: 'Assinaturas concluídas',
  sent_to_sesc: 'Enviada ao Sesc',
  payment_confirmed: 'Pagamento confirmado',
  none: 'Nenhuma folha disponível',
}
