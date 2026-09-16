import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category } from '../../scripts/types'

export type Lang = 'ro' | 'en'

const dict = {
  ro: {
    title: 'Harta Educației Tehnice din România',
    entities: 'entități',
    search: 'Caută...',
    searchAria: 'Caută entități',
    clearSearch: 'Șterge căutarea',
    backToRomania: 'Înapoi la România',
    romania: 'România',
    allRomania: 'Toată România',
    empty: 'Nimic aici. Schimbă filtrele.',
    hasEmail: 'are email',
    filters: 'Filtre categorie',
    list: 'Listă entități',
    mapAria: 'Harta României pe județe',
    email: 'Email',
    phone: 'Telefon',
    contact: 'Contact',
    site: 'Site',
    partOf: 'Parte din',
    related: 'Legate',
    source: 'sursă',
    language: 'Limbă',
    cat: {
      universitate: ['Universități', 'Univ'],
      facultate: ['Facultăți CS', 'Fac'],
      liceu: ['Licee mate-info', 'Liceu'],
      robotica: ['Robotică FTC', 'FTC'],
      centru_excelenta: ['Centre excelență', 'CEX'],
      asociatie_studenti: ['Asociații studenți', 'Asoc'],
      hub: ['Hubs', 'Hub'],
      ong: ['ONG', 'ONG'],
    } as Record<Category, [string, string]>,
    catDesc: {
      universitate: 'Universități cu profil tehnic, ordonate după metaranking-ul național.',
      facultate: 'Facultăți de informatică, calculatoare și automatică din interiorul universităților.',
      liceu: 'Licee cu profil matematică-informatică.',
      centru_excelenta: 'Centre județene de excelență: pregătire pentru olimpiade de informatică și științe.',
      robotica: 'Echipe de liceu înscrise în FIRST Tech Challenge (FTC) România.',
      asociatie_studenti: 'Asociații studențești tech și de antreprenoriat (LSAC, BEST, IEEE, LSRS).',
      hub: 'Hub-uri tech, spații de coworking și comunități care găzduiesc evenimente.',
      ong: 'ONG-uri din registrul național cu obiect de activitate tech sau educațional.',
    } as Record<Category, string>,
  },
  en: {
    title: 'Romanian Technical Education Map',
    entities: 'entities',
    search: 'Search...',
    searchAria: 'Search entities',
    clearSearch: 'Clear search',
    backToRomania: 'Back to Romania',
    romania: 'Romania',
    allRomania: 'All of Romania',
    empty: 'Nothing here. Change the filters.',
    hasEmail: 'has email',
    filters: 'Category filters',
    list: 'Entity list',
    mapAria: 'Map of Romania by county',
    email: 'Email',
    phone: 'Phone',
    contact: 'Contact',
    site: 'Website',
    partOf: 'Part of',
    related: 'Related',
    source: 'source',
    language: 'Language',
    cat: {
      universitate: ['Universities', 'Univ'],
      facultate: ['CS Faculties', 'Fac'],
      liceu: ['Math-CS High Schools', 'HS'],
      robotica: ['FTC Robotics', 'FTC'],
      centru_excelenta: ['Excellence Centers', 'CEX'],
      asociatie_studenti: ['Student Orgs', 'Org'],
      hub: ['Hubs', 'Hub'],
      ong: ['NGOs', 'NGO'],
    } as Record<Category, [string, string]>,
    catDesc: {
      universitate: 'Universities with a technical profile, ordered by the national metaranking.',
      facultate: 'Computer science, computing and automation faculties inside universities.',
      liceu: 'High schools running a math-computer science track.',
      centru_excelenta: 'County excellence centers: olympiad training in computer science and sciences.',
      robotica: 'High school teams competing in FIRST Tech Challenge (FTC) Romania.',
      asociatie_studenti: 'Student tech and entrepreneurship organizations (LSAC, BEST, IEEE, LSRS).',
      hub: 'Tech hubs, coworking spaces and communities that host events.',
      ong: 'NGOs from the national register with a tech or education purpose.',
    } as Record<Category, string>,
  },
}

export type Dict = (typeof dict)['ro']

const KEY = 'solscout.lang'
function initial(): Lang {
  try {
    const s = localStorage.getItem(KEY)
    if (s === 'ro' || s === 'en') return s
  } catch { /* ignore */ }
  return navigator.language.toLowerCase().startsWith('ro') ? 'ro' : 'en'
}

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: 'ro', t: dict.ro, setLang: () => {} })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(initial)
  const setLang = useCallback((l: Lang) => {
    set(l)
    try { localStorage.setItem(KEY, l) } catch { /* ignore */ }
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = dict[lang].title
  }, [lang])
  const value = useMemo(() => ({ lang, t: dict[lang], setLang }), [lang, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useI18n = () => useContext(Ctx)
