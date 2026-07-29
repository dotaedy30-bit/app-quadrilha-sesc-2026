import { useEffect, useState } from 'react'
import { getPayrollStatus } from '../services/api'
import type { PayrollStatus as PayrollType } from '../services/api'

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Em espera',
  released_for_signature: 'Liberada para assinatura',
  signing_in_progress: 'Assinaturas em andamento',
  signatures_completed: 'Assinaturas concluídas',
  sent_to_sesc: 'Enviada ao Sesc',
  payment_confirmed: 'Pagamento confirmado',
  none: 'Nenhuma folha disponível',
}

const STATUS_COLORS: Record<string, string> = {
  waiting: '#e8a84c',
  released_for_signature: '#4d9c69',
  signing_in_progress: '#42cbe1',
  signatures_completed: '#2589e8',
  sent_to_sesc: '#8e54d9',
  payment_confirmed: '#4d9c69',
}

export function FolhaPagamento() {
  const [payroll, setPayroll] = useState<PayrollType | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    setError('')
    getPayrollStatus()
      .then(data => { setPayroll(data); setLoading(false) })
      .catch(() => { setError('Não foi possível carregar as informações.'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="student-page"><div className="loading-spinner" /><p className="loading-text">Carregando...</p></div>
  if (error) return <div className="student-page"><p className="error-text">{error}</p><button className="retry-btn" onClick={load}>Tentar novamente</button></div>
  if (!payroll || payroll.status === 'none') return <div className="student-page"><h2 className="page-title">Folha de Pagamento</h2><p className="empty-text">Nenhuma folha de pagamento disponível.</p></div>

  const isReleased = payroll.status === 'released_for_signature' || payroll.status === 'signing_in_progress'
  const statusColor = STATUS_COLORS[payroll.status] || '#b09587'

  return <div className="student-page folha-page">
    <h2 className="page-title">Folha de Pagamento</h2>
    <p className="page-subtitle">{payroll.month}/{payroll.year}</p>

    {isReleased && <div className="payroll-alert">
      <strong>Folha de pagamento liberada.</strong> Compareça ao Sesc para assinar obrigatoriamente.
    </div>}

    <div className="payroll-status-card" style={{ borderColor: statusColor + '44', background: statusColor + '0a' }}>
      <span className="payroll-status-label">Status</span>
      <span className="payroll-status-value" style={{ color: statusColor }}>{STATUS_LABELS[payroll.status] || payroll.status}</span>
    </div>

    <div className="payroll-info-grid">
      <div><strong>Data prevista:</strong> {payroll.expected_date ? new Date(payroll.expected_date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</div>
      <div><strong>Prazo de assinatura:</strong> {payroll.signature_deadline ? new Date(payroll.signature_deadline + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</div>
      {payroll.updated_at && <div><strong>Última atualização:</strong> {new Date(payroll.updated_at).toLocaleString('pt-BR')}</div>}
    </div>

    {payroll.public_message && <div className="payroll-message">
      <strong>Mensagem:</strong> {payroll.public_message}
    </div>}
  </div>
}
