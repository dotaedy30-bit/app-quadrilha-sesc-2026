import { appConfig } from '../config/appConfig'

export function Splash() {
  return <div className="splash" role="status" aria-label="Carregando aplicativo">
    <div className="flags flags-top" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div>
    <div className="sparkles" aria-hidden="true">✦ <span>✧</span> ✦ <span>✧</span></div>
    <div className="splash-logo"><img src={appConfig.icons.splash} alt="Ícone da Quadrilha do Sesc 2026" /></div>
    <div className="splash-copy">
      <p className="eyebrow">SÃO JOÃO • MÚSICA • TRADIÇÃO</p>
      <h1>{appConfig.name}</h1><h2>{appConfig.subtitle}</h2>
      <div className="splash-rule" />
      <p className="splash-professor">{appConfig.professor}</p><small className="splash-author">{appConfig.credit}</small>
    </div>
    <div className="loading"><div className="loading-dots"><i/><i/><i/></div><span>Preparando o roteiro sonoro...</span></div>
    <div className="fire" aria-hidden="true"><i/><i/><i/></div>
  </div>
}
