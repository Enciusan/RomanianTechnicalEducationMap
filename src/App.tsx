import { useEffect, useMemo, useState } from 'react'
import { RomaniaMap } from '@/components/RomaniaMap'
import { GlassBar } from '@/components/GlassBar'
import { EntityList } from '@/components/EntityList'
import { EntityDialog } from '@/components/EntityDialog'
import { CATEGORIES, DATA, norm, type Category, type Entity } from '@/lib/entities'

const DEFAULT_CATS = new Set<Category>(CATEGORIES.filter((c) => c !== 'ong'))

export default function App() {
  const [judet, setJudet] = useState<string | null>(null)
  const [cats, setCats] = useState<Set<Category>>(DEFAULT_CATS)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Entity | null>(null)

  const filtered = useMemo(() => {
    const q = norm(query.trim())
    return DATA.filter((e) => cats.has(e.category) && (!q || norm(`${e.name} ${e.city ?? ''} ${e.notes ?? ''}`).includes(q)))
  }, [cats, query])

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of filtered) m.set(e.judet, (m.get(e.judet) ?? 0) + 1)
    return m
  }, [filtered])

  const scoped = useMemo(() => (judet ? filtered.filter((e) => e.judet === judet) : filtered), [filtered, judet])

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && !selected && judet) setJudet(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [judet, selected])

  const toggleCat = (c: Category) =>
    setCats((s) => {
      const n = new Set(s)
      if (n.has(c)) n.delete(c); else n.add(c)
      return n
    })

  const openEntity = (e: Entity) => {
    if (e.judet !== judet && e.judet !== '?') setJudet(e.judet)
    setSelected(e)
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.02_280)_0%,transparent_60%)]" aria-hidden />
      <div className="absolute inset-0 pt-28 pb-4 pl-2 md:pr-[360px] lg:pr-[400px]">
        <RomaniaMap entities={filtered} counts={counts} judet={judet} selectedId={selected?.id ?? null} onJudet={(c) => { setJudet(c); setSelected(null) }} onEntity={openEntity} />
      </div>
      <GlassBar query={query} onQuery={setQuery} cats={cats} onToggleCat={toggleCat} judet={judet} onJudet={(c) => { setJudet(c); setSelected(null) }} total={scoped.length} />
      <EntityList entities={scoped} judet={judet} selectedId={selected?.id ?? null} onEntity={openEntity} />
      <EntityDialog entity={selected} onClose={() => setSelected(null)} onEntity={openEntity} />
    </main>
  )
}
