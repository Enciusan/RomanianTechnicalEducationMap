import { ArrowLeft, Search, X } from 'lucide-react'
import { CATEGORIES, CATEGORY, JUDET_NAME, type Category } from '@/lib/entities'

interface Props {
  query: string
  onQuery: (q: string) => void
  cats: Set<Category>
  onToggleCat: (c: Category) => void
  judet: string | null
  onJudet: (code: string | null) => void
  total: number
}

export function GlassBar({ query, onQuery, cats, onToggleCat, judet, onJudet, total }: Props) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto glass flex items-center gap-2 rounded-2xl px-2 py-1.5">
        {judet ? (
          <button
            onClick={() => onJudet(null)}
            className="glass-pill flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-sm font-medium"
            aria-label="Înapoi la România"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">România</span>
          </button>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col px-2 leading-tight">
          <span className="truncate text-[15px] font-semibold tracking-tight">{judet ? JUDET_NAME.get(judet) : 'Harta Sisteme Învățământ'}</span>
          <span className="tabular text-xs text-muted-foreground">{total} entități</span>
        </div>
        <label className="glass-pill flex h-10 w-40 items-center gap-2 rounded-xl px-3 sm:w-64">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Caută…"
            aria-label="Caută entități"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => onQuery('')} aria-label="Șterge căutarea" className="cursor-pointer text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      <nav className="pointer-events-auto flex flex-wrap gap-1.5" aria-label="Filtre categorie">
        {CATEGORIES.map((c) => {
          const on = cats.has(c)
          return (
            <button
              key={c}
              onClick={() => onToggleCat(c)}
              data-active={on}
              aria-pressed={on}
              className="glass-pill flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-[13px] font-medium backdrop-blur-xl"
              style={{ opacity: on ? 1 : 0.6 }}
            >
              <span className="size-2 rounded-full" style={{ background: CATEGORY[c].color, boxShadow: on ? `0 0 8px ${CATEGORY[c].color}` : 'none' }} aria-hidden />
              {CATEGORY[c].label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
