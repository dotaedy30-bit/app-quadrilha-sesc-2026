import { appConfig } from '../config/appConfig'
import {
  InicioIcon, QuadrilheirosIcon, FrequenciaIcon, NotasIcon,
  RankingIcon, PagamentoIcon, SobreIcon, CloseIcon
} from './Icons'

interface SidebarProps {
  activeItem: string
  onNavigate: (item: string) => void
  onClose: () => void
  open: boolean
}

const navItems = [
  { id: 'inicio', label: 'Início', icon: InicioIcon },
  { id: 'quadrilheiros', label: 'Quadrilheiros', icon: QuadrilheirosIcon },
  { id: 'frequencia', label: 'Frequência', icon: FrequenciaIcon },
  { id: 'notas', label: 'Notas e Avaliações', icon: NotasIcon },
  { id: 'ranking', label: 'Ranking', icon: RankingIcon },
  { id: 'pagamento', label: 'Folha de Pagamento', icon: PagamentoIcon },
  { id: 'sobre', label: 'Sobre o Aplicativo', icon: SobreIcon },
]

export function Sidebar({ activeItem, onNavigate, onClose, open }: SidebarProps) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} role="presentation" />}
      <aside className={`student-sidebar ${open ? 'open' : ''}`} role="navigation" aria-label="Menu dos quadrilheiros">
        <div className="sidebar-header">
          <img src={appConfig.icons.favicon} alt="" className="sidebar-logo" />
          <span className="sidebar-app-name">{appConfig.name}</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu"><CloseIcon /></button>
        </div>
        <div className="sidebar-student-label">
          <span>Área dos Quadrilheiros</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`sidebar-nav-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { onNavigate(item.id); onClose() }} aria-current={activeItem === item.id ? 'page' : undefined}>
              <item.icon /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>{appConfig.credit}</small>
        </div>
      </aside>
    </>
  )
}
