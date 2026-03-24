import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const SiteDataContext = createContext(null)

export function SiteDataProvider({ children }) {
  const [siteData, setSiteData] = useState({ header: null, socials: [], footerServices: [], footerContact: null })

  useEffect(() => {
  api.get(`/site/global?t=${Date.now()}`)
    .then(r => setSiteData(r.data))
    .catch(() => {})
}, [])

  return (
    <SiteDataContext.Provider value={siteData}>
      {children}
    </SiteDataContext.Provider>
  )
}

export function useSiteData() {
  return useContext(SiteDataContext)
}
