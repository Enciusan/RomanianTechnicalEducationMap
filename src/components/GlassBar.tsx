import { ArrowLeft, Search, X } from 'lucide-react'
import { CATEGORIES, CATEGORY, JUDET_NAME, type Category } from '@/lib/entities'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n, type Lang } from '@/lib/i18n'

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
  const { t, lang, setLang } = useI18n()
  return (
    <header className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex flex-col gap-2 p-3 sm:p-4 md:right-[360px] lg:right-[400px]">
      <div className="pointer-events-auto glass flex items-center gap-2 rounded-2xl px-2 py-1.5">
        {judet ? (
          <button
            onClick={() => onJudet(null)}
            className="glass-pill flex h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-sm font-medium"
            aria-label={t.backToRomania}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{t.romania}</span>
          </button>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col px-2 leading-tight">
          <span className="truncate text-[15px] font-semibold tracking-tight">{judet ? JUDET_NAME.get(judet) : t.title}</span>
          <span className="tabular text-xs text-muted-foreground">{total} {t.entities}</span>
        </div>
        <label className="glass-pill flex h-10 w-40 items-center gap-2 rounded-xl px-3 sm:w-64">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.searchAria}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => onQuery('')} aria-label={t.clearSearch} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </label>
        <div className="glass-pill flex h-10 items-center rounded-xl p-0.5" role="group" aria-label={t.language}>
          {(['ro', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className="h-full cursor-pointer rounded-[10px] px-2.5 text-xs font-semibold tracking-wide uppercase transition-colors data-[active=true]:bg-white/14 data-[active=false]:text-muted-foreground"
              data-active={lang === l}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <nav className="pointer-events-auto flex flex-wrap gap-1.5" aria-label={t.filters}>
        {CATEGORIES.map((c) => {
          const on = cats.has(c)
          return (
            <Tooltip key={c}>
              <TooltipTrigger
                onClick={() => onToggleCat(c)}
                data-active={on}
                aria-pressed={on}
                className="glass-pill flex h-9 cursor-pointer items-center gap-2 rounded-full px-3 text-[13px] font-medium backdrop-blur-xl"
                style={{ opacity: on ? 1 : 0.6 }}
              >
                <span className="size-2 rounded-full" style={{ background: CATEGORY[c].color, boxShadow: on ? `0 0 8px ${CATEGORY[c].color}` : 'none' }} aria-hidden />
                {t.cat[c][0]}
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px] text-left leading-snug">
                {t.catDesc[c]}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </header>
  )
}
