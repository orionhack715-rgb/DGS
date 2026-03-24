import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { SiteDataProvider } from './contexts/SiteDataContext'

import SiteLayout from './components/layout/SiteLayout'
import Accueil from './pages/site/Accueil'
import Propos from './pages/site/Propos'
import Services from './pages/site/Services'
import Realisation from './pages/site/Realisation'
import NotreEquipe from './pages/site/NotreEquipe'
import Formulaire from './pages/site/Formulaire'
import NotFound from './pages/site/NotFound'

import AdminLayout from './components/layout/AdminLayout'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminServices from './pages/admin/AdminServices'
import AdminPeople from './pages/admin/AdminPeople'
import AdminProjects from './pages/admin/AdminProjects'
import AdminMembers from './pages/admin/AdminMembers'
import AdminSiteContent from './pages/admin/AdminSiteContent'
import AdminDomaines from './pages/admin/AdminDomaines'
import AdminEquipePropos from './pages/admin/AdminEquipePropos'
import AdminMailing from './pages/admin/AdminMailing'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <SiteDataProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Navigate to="/accueil" replace />} />
              <Route path="/accueil" element={<Accueil />} />
              <Route path="/propos" element={<Propos />} />
              <Route path="/services" element={<Services />} />
              <Route path="/realisation" element={<Realisation />} />
              <Route path="/notreEquipe" element={<NotreEquipe />} />
              <Route path="/formulaire" element={<Formulaire />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/backoffice/login" element={<AdminLogin />} />
            <Route path="/backoffice" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="people" element={<AdminPeople />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="site-content" element={<AdminSiteContent />} />
              <Route path="domaines" element={<AdminDomaines />} />
              <Route path="equipe-propos" element={<AdminEquipePropos />} />
              <Route path="mailing" element={<AdminMailing />} />
            </Route>
          </Routes>
        </SiteDataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}