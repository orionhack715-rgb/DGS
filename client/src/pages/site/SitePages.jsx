import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { uploadSrc } from '../../utils/uploads'

// ─── Services ─────────────────────────────────────────────────────────────────
export function Services() {
  const [catalog, setCatalog] = useState([])
  const [legacy, setLegacy] = useState([])

  useEffect(() => {
    api.get('/site/services').then(r => {
      setCatalog(r.data.services_catalog)
      setLegacy(r.data.legacy_services)
    }).catch(() => {})
    if (typeof window.AOS !== 'undefined') window.AOS.refreshHard()
  }, [])

  return (
    <>
      <section className="hero-section" style={{ padding: 'clamp(3.5rem,6vw,5rem) 0' }}>
        <div className="container text-center">
          <span className="hero-kicker"><i className="ri-service-line"></i> Nos Services</span>
          <h1 className="mt-2">Des solutions adaptées à chaque besoin</h1>
          <p className="lead">Développement web, design, marketing digital et bien plus encore.</p>
        </div>
      </section>

      <section className="section-shell">
        <div className="container">
          {catalog.length > 0 && (
            <>
              <div className="section-heading reveal" data-aos="fade-up">
                <span className="eyebrow">Catalogue</span>
                <h2 className="fw-bold">Services Disponibles</h2>
              </div>
              <div className="row g-4 mb-5">
                {catalog.map(s => (
                  <div className="col-md-4" key={s.id} data-aos="fade-up">
                    <div className="service-card service-card-public reveal tilt-card h-100">
                      <span className="icon-chip"><i className="ri-checkbox-circle-line"></i></span>
                      <h3 className="mt-3">{s.name}</h3>
                      <p>{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {legacy.length > 0 && (
            <>
              <div className="section-heading reveal legacy-stack" data-aos="fade-up">
                <span className="eyebrow">Offres</span>
                <h2 className="fw-bold">Nos Prestations</h2>
              </div>
              <div className="row g-4">
                {legacy.map(s => (
                  <div className="col-md-6 col-lg-4" key={s.id} data-aos="fade-up">
                    <div className="project-card reveal h-100">
                      {s.libelleImage && (
                        <div className="project-media">
                          <img src={uploadSrc(`images/${s.libelleImage}`)} alt={s.nom} />
                        </div>
                      )}
                      <div className="project-body">
                        <h3 className="h5">{s.nom}</h3>
                        <p className="text-muted small">{s.description}</p>
                        {s.criteres_services && (
                          <ul className="small ps-3 mb-0">
                            {s.criteres_services.split(',').map((c, i) => <li key={i}>{c.trim()}</li>)}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="cta-panel text-center mt-5 reveal" data-aos="fade-up">
            <i className="ri-customer-service-2-line cta-icon"></i>
            <h3 className="text-white">Un besoin spécifique ?</h3>
            <Link to="/formulaire" className="btn btn-light btn-lg px-5 rounded-pill">Discutons-en</Link>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Realisation ──────────────────────────────────────────────────────────────
export function Realisation() {
  const [realisations, setRealisations] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/site/realisations').then(r => setRealisations(r.data.realisations)).catch(() => {})
    if (typeof window.AOS !== 'undefined') window.AOS.refreshHard()
  }, [])

  const categories = ['all', ...new Set(realisations.map(r => r.categorie).filter(Boolean))]
  const filtered = filter === 'all' ? realisations : realisations.filter(r => r.categorie === filter)

  return (
    <>
      <section className="hero-section" style={{ padding: 'clamp(3.5rem,6vw,5rem) 0' }}>
        <div className="container text-center">
          <span className="hero-kicker"><i className="ri-folder-open-line"></i> Réalisations</span>
          <h1 className="mt-2">Nos Projets</h1>
          <p className="lead">Une équipe nouvelle génération, des résultats concrets dès le premier sprint.</p>
        </div>
      </section>

      <section className="section-shell">
        <div className="container">
          {categories.length > 1 && (
            <div className="d-flex gap-2 flex-wrap mb-4 justify-content-center">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === 'all' ? 'Tous' : cat}
                </button>
              ))}
            </div>
          )}
          <div className="row g-4">
            {filtered.map(r => (
              <div className="col-md-6 col-lg-4" key={r.id} data-aos="fade-up">
                <div className="project-card reveal h-100">
                  {r.libelleImage && (
                    <div className="project-media">
                      <img src={uploadSrc(`images/${r.libelleImage}`)} alt={r.nom} />
                    </div>
                  )}
                  <div className="project-body">
                    {r.categorie && <span className="mini-tag mb-2 d-inline-block">{r.categorie}</span>}
                    <h3 className="h5">{r.nom}</h3>
                    <p className="text-muted small">{r.description}</p>
                    {r.lien_button && (
                      <a href={r.lien_button} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mt-2">
                        Voir le projet <i className="ri-external-link-line"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Propos ───────────────────────────────────────────────────────────────────
export function Propos() {
  const [membres, setMembres] = useState([])

  useEffect(() => {
    api.get('/site/propos').then(r => setMembres(r.data.membres)).catch(() => {})
    if (typeof window.AOS !== 'undefined') window.AOS.refreshHard()
  }, [])

  return (
    <>
      <section className="hero-section" style={{ padding: 'clamp(3.5rem,6vw,5rem) 0' }}>
        <div className="container text-center">
          <span className="hero-kicker"><i className="ri-information-line"></i> À propos</span>
          <h1 className="mt-2">Notre Agence</h1>
          <p className="lead">Découvrez Digital Get Services — 120+ missions, 98% de satisfaction.</p>
        </div>
      </section>

      <section className="section-shell">
        <div className="container">
          <div className="row g-4 align-items-center mb-5">
            <div className="col-lg-6" data-aos="fade-right">
              <div className="story-panel">
                <span className="eyebrow">Notre histoire</span>
                <h2 className="fw-bold mt-2">Un studio digital ambitieux</h2>
                <p className="text-muted">
                  Groupe de jeunes entrepreneurs passionnés par le digital, nous accompagnons nos clients
                  dans leur transformation numérique depuis la conception jusqu'au déploiement.
                </p>
                <div className="timeline-item"><i className="ri-shield-check-line"></i> Qualité professionnelle garantie</div>
                <div className="timeline-item"><i className="ri-time-line"></i> Livraison dans les délais</div>
                <div className="timeline-item"><i className="ri-headphone-line"></i> Support réactif 24/7</div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {membres.map(m => (
                  <div className="col-6" key={m.id} data-aos="zoom-in">
                    <div className="service-card text-center reveal">
                      <i className={`${m.icon} fs-2 text-primary mb-2 d-block`}></i>
                      <h4 className="h6 fw-bold">{m.nom}</h4>
                      <p className="small text-muted mb-0">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── NotreEquipe ──────────────────────────────────────────────────────────────
export function NotreEquipe() {
  const [people, setPeople] = useState([])
  const [membres, setMembres] = useState([])

  console.log('RENDER - membres.length:', membres.length)  // ← ajouter

  useEffect(() => {
  api.get('/site/equipe').then(r => {
    console.log('DATA REÇUE:', r.data)        // ← ajouter
    console.log('membres:', r.data.membres)   // ← ajouter
    setPeople(r.data.service_people)
    setMembres(r.data.membres)
  }).catch(err => {
    console.error('ERREUR:', err)             // ← ajouter
  })
  if (typeof window.AOS !== 'undefined') window.AOS.refreshHard()
}, [])

  return (
    <>
      <section className="hero-section" style={{ padding: 'clamp(3.5rem,6vw,5rem) 0' }}>
        <div className="container text-center">
          <span className="hero-kicker"><i className="ri-team-line"></i> Notre Équipe</span>
          <h1 className="mt-2">Les Experts Derrière Vos Projets</h1>
          <p className="lead">Des professionnels passionnés à votre service.</p>
        </div>
      </section>

      {people.length > 0 && (
        <section className="section-shell">
          <div className="container">
            <div className="section-heading reveal"><span className="eyebrow">Prestataires</span><h2>Notre Réseau d'Experts</h2></div>
            <div className="row g-4">
              {people.map(p => (
                <div className="col-md-4 col-lg-3" key={p.id} >
                  <div className="service-card text-center reveal">
                    {p.photo_path ? (
                      <img src={uploadSrc(`service_people/${p.photo_path}`)} alt={p.full_name}
                        className="rounded-circle mb-2" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    ) : (
                      <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-2"
                        style={{ width: 80, height: 80, fontSize: '2rem', color: '#fff' }}>
                        {p.full_name[0]}
                      </div>
                    )}
                    <h4 className="h6 fw-bold">{p.full_name}</h4>
                    <p className="small text-muted">{p.specialty}</p>
                    {p.services?.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                        {p.services.map(s => <span key={s.id} className="mini-tag">{s.name}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {membres.length > 0 && (
        <section className="section-shell pt-0">
          <div className="container">
            <div className="section-heading reveal"><span className="eyebrow">Équipe</span><h2>Nos Membres</h2></div>
            <div className="row g-4">
              {membres.map(m => (
                <div className="col-md-4 col-lg-3" key={m.id} >
                  <div className="service-card text-center reveal">
                    {m.libelleImage ? (
                      <img src={uploadSrc(`images/${m.libelleImage}`)} alt={m.nom}
                        className="rounded-circle mb-2" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    ) : (
                      <div className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center mb-2"
                        style={{ width: 80, height: 80, fontSize: '2rem', color: '#fff' }}>
                        {m.nom?.[0]}
                      </div>
                    )}
                    <h4 className="h6 fw-bold">{m.nom}</h4>
                    <p className="small text-muted">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
