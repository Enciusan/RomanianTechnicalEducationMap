import { useMemo } from 'react'
import { ChevronRight, Mail } from 'lucide-react'
import { CATEGORY, CATEGORIES, JUDET_NAME, type Entity } from '@/lib/entities'
import { useI18n } from '@/lib/i18n'

interface Props {
  entities: Entity[]
  judet: string | null
  selectedId: string | null
  onEntity: (e: Entity) => void
}

export function EntityList({ entities, judet, selectedId, onEntity }: Props) {
  const { t } = useI18n()
  const groups = useMemo(() => {
    const m = new Map<string, Entity[]>()
    for (const e of entities) (m.get(e.category) ?? m.set(e.category, []).get(e.category)!).push(e)
    return CATEGORIES.filter((c) => m.has(c)).map((c) => [c, m.get(c)!] as const)
  }, [entities])

  return (
    <aside className="glass absolute inset-y-3 right-3 z-10 hidden w-[340px] flex-col overflow-hidden rounded-2xl md:flex lg:w-[380px]" aria-label={t.list}>
      <div className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold tracking-tight">{judet ? JUDET_NAME.get(judet) : t.allRomania}</h2>
        <span className="tabular text-xs text-muted-foreground">{entities.length}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 [scrollbar-width:thin]">
        {groups.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">{t.empty}</p>}
        {groups.map(([c, list]) => (
          <section key={c} className="mb-2">
            <h3 className="sticky top-0 z-10 flex items-center gap-2 bg-[color-mix(in_oklab,var(--card)_85%,transparent)] px-2 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase backdrop-blur-md">
              <span className="size-1.5 rounded-full" style={{ background: CATEGORY[c].color }} aria-hidden />
              {t.cat[c][0]} <span className="tabular ml-auto">{list.length}</span>
            </h3>
            <ul>
              {list.map((e) => (
                <li key={e.id}>
                  <button
                    onClick={() => onEntity(e)}
                    data-active={e.id === selectedId}
                    className="group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/6 data-[active=true]:bg-white/10"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] leading-tight">{e.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {!judet && <span>{e.judet}</span>}
                        {e.city && <span className="truncate">{e.city}</span>}
                        {e.rank != null && <span className="tabular">#{e.rank}</span>}
                        {e.email && <Mail className="size-3 opacity-70" aria-label={t.hasEmail} />}
                      </div>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}
