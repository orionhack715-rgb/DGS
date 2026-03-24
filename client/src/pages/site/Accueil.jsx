import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function Accueil() {
  const [domaines, setDomaines] = useState([])

  useEffect(() => {
  api.get('/site/accueil').then(r => setDomaines(r.data.domaines)).catch(() => {})
}, [])

useEffect(() => {
  if (typeof window.AOS !== 'undefined') {
    window.AOS.init({ duration: 800, once: true })
  }
}, [])

  return (
    <>
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7 text-lg-start text-center">
              <div className="hero-pills reveal" data-aos="fade-down">
                <span className="glass-pill"><i className="ri-vip-crown-2-line"></i> Studio Premium</span>
                <span className="glass-pill"><i className="ri-flashlight-line"></i> Build Fast</span>
                <span className="glass-pill"><i className="ri-shield-check-line"></i> Qualité Pro</span>
              </div>
              <h1 data-aos="fade-up">VOS SOLUTIONS DIGITALES TOUT-EN-UN</h1>
              <p className="lead mx-lg-0" data-aos="fade-up" data-aos-delay="100">
                Digital Get Services conçoit et exécute des expériences digitales performantes pour accélérer votre croissance.
              </p>
              <div className="hero-actions justify-content-lg-start" data-aos="fade-up" data-aos-delay="200">
                <Link to="/formulaire" className="btn btn-primary btn-lg magnetic-btn">Démarrer maintenant</Link>
                <Link to="/services" className="btn btn-outline-light btn-lg magnetic-btn">Voir nos offres</Link>
              </div>
              <p className="hero-trust mt-3 mb-0">
                <i className="ri-checkbox-circle-line"></i> Audit initial offert, sans engagement.
              </p>
              <div className="hero-metrics stagger mt-4" data-aos="zoom-in" data-aos-delay="250">
                {[['120+', 'Missions digitales'], ['98%', 'Satisfaction client'], ['24/7', 'Support projet']].map(([val, label]) => (
                  <div className="metric-card tilt-card spotlight-card reveal" key={label}>
                    <h3>{val}</h3>
                    <p>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5" data-aos="fade-left">
              <aside className="hero-side-panel reveal tilt-card spotlight-card">
                <h3 className="h4 mb-3">Votre parcours en 3 étapes</h3>
                <div className="flow-item"><i className="ri-chat-1-line"></i> Brief et cadrage précis</div>
                <div className="flow-item"><i className="ri-draft-line"></i> Prototype et validation UX</div>
                <div className="flow-item"><i className="ri-rocket-line"></i> Livraison et optimisation</div>
                <Link to="/formulaire" className="btn btn-light w-100 mt-3 magnetic-btn">Démarrer un projet</Link>
                <p className="small text-white-50 mt-3 mb-0">Temps de réponse moyen : moins de 24 heures.</p>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Domaines */}
      <section className="section-shell">
        <div className="container">
          <div className="section-heading reveal" data-aos="fade-up">
            <span className="eyebrow">Expertise</span>
            <h2 className="fw-bold">Nos Domaines d'Expertise</h2>
            <p className="text-muted lead">Une organisation claire pour vous offrir des résultats rapides et mesurables.</p>
          </div>
          <div className="row g-4">
            {domaines.map(d => (
              <div className="col-md-4" key={d.id} data-aos="fade-up">
                <div className="service-card reveal tilt-card spotlight-card h-100">
                  <span className="icon-chip"><i className="ri-star-smile-line"></i></span>
                  <i className={`${d.icon} mt-3 d-block`}></i>
                  <h3>{d.nom}</h3>
                  <p>{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process + CTA */}
      <section className="section-shell pt-1">
        <div className="container">
          <div className="process-strip reveal" data-aos="fade-up">
            {[['ri-search-eye-line', 'Analyse'], ['ri-layout-4-line', 'UX/UI'], ['ri-code-s-slash-line', 'Développement'], ['ri-line-chart-line', 'Optimisation']].map(([icon, label]) => (
              <div className="process-step" key={label}><i className={icon}></i> {label}</div>
            ))}
          </div>
          <div className="cta-panel reveal tilt-card mt-4 text-center" data-aos="fade-up">
            <i className="ri-rocket-2-line cta-icon"></i>
            <h3 className="text-white">Prêt à transformer vos idées en réalité ?</h3>
            <Link to="/formulaire" className="btn btn-light btn-lg px-5 rounded-pill magnetic-btn">
              Contactez-nous maintenant
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
